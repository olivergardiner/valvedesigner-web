const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const http = require('node:http');
const assert = require('node:assert/strict');
const root = path.join(__dirname, '..');
const data = JSON.parse(fs.readFileSync(path.join(root, 'public/tubes.json'), 'utf8'));
function context(overrides = {}) {
	const ctx = vm.createContext({structuredClone, AbortController, setTimeout, clearTimeout, ...overrides});
	vm.runInContext(fs.readFileSync(path.join(root, 'public/tubes.js'), 'utf8'), ctx);
	vm.runInContext(fs.readFileSync(path.join(root, 'public/workspace-startup.js'), 'utf8'), ctx);
	return ctx;
}
function response(body = data) { return {ok:true, json: async () => structuredClone(body)}; }
function fakeDocument(protocol = 'http:') {
	const elements = Object.fromEntries(['workspace','catalogue-loading','catalogue-status','catalogue-error','catalogue-retry'].map(id => [id, {
		hidden:false, textContent:'', attributes:{}, handlers:{},
		setAttribute(key,value) { this.attributes[key] = value; },
		addEventListener(name, handler) { this.handlers[name] = handler; }
	}]));
	const location = {protocol, hash:'#triodecc', reload() { this.reloaded = true; }};
	return {elements, defaultView:{location}, getElementById(id) { return elements[id]; }};
}
(async () => {
	let resolveFetch;
	let calls = 0;
	const ctx = context({fetch: (url, options) => {
		calls++;
		assert.equal(url, 'tubes.json');
		assert.ok(options.signal);
		return new Promise(resolve => { resolveFetch = resolve; });
	}});
	const first = vm.runInContext('loadValveCatalogue()', ctx);
	const second = vm.runInContext('loadValveCatalogue()', ctx);
	assert.equal(first, second);
	assert.equal(calls, 1);
	assert.equal(vm.runInContext('smallSignalTriodes.length', ctx), 0);
	resolveFetch(response());
	await first;
	assert.equal(vm.runInContext('smallSignalTriodes.length', ctx), 6);
	await vm.runInContext('loadValveCatalogue()', ctx);
	assert.equal(calls, 1, 'Successful load cached');

	for (const failure of [
		async () => { throw Error('Network unavailable'); },
		async () => ({ok:false, status:404}),
		async () => ({ok:true, json: async () => { throw SyntaxError('bad JSON'); }}),
		async () => response({version:2, devices:[]})
	]) {
		const runtime = context({fetch: failure});
		await assert.rejects(vm.runInContext('loadValveCatalogue()', runtime));
		assert.equal(vm.runInContext('valveCatalogue', runtime), null);
		runtime.fetch = async () => response();
		await vm.runInContext('loadValveCatalogue()', runtime);
		assert.equal(vm.runInContext('valveCatalogue.devices.length', runtime), 15);
	}
	let timeoutCallback;
	const timeoutContext = context({fetch: () => new Promise(() => {}), setTimeout: callback => { timeoutCallback = callback; return 1; }, clearTimeout() {}});
	const timeout = vm.runInContext('loadValveCatalogue()', timeoutContext);
	const rejected = assert.rejects(timeout, /timed out/);
	timeoutCallback();
	await rejected;

	const invalid = [
		value => { value.devices[0].name = value.devices[1].name; },
		value => { value.devices[0].static.mu = 100; },
		value => { value.devices[0].display.vaMax = 0; },
		value => { value.devices[0].fitting.vg1Step = 0; },
		value => { delete value.devices[0].model.kp; },
		value => { value.devices[0].model.type = 'unknown'; },
		value => { value.devices = value.devices.filter(entry => entry.category !== 'smallSignalPentodes'); }
	];
	for (const alter of invalid) {
		const altered = structuredClone(data); alter(altered); ctx.invalid = altered;
		assert.throws(() => vm.runInContext('installValveCatalogue(invalid)', ctx), /Invalid tube catalogue/);
		assert.equal(vm.runInContext('valveCatalogue.devices[0].name', ctx), data.devices[0].name, 'No partial replacement on invalid input');
	}

	const doc = fakeDocument();
	let resolveLoad;
	let starts = 0;
	const start = vm.runInContext('startValveWorkspace', ctx);
	const pending = start(doc, () => { starts++; assert.equal(doc.defaultView.location.hash, '#pentodecc'); }, () => new Promise(resolve => { resolveLoad = resolve; }));
	assert.equal(starts, 0);
	assert.equal(doc.elements.workspace.hidden, true);
	doc.defaultView.location.hash = '#pentodecc';
	resolveLoad(); await pending;
	assert.equal(starts, 1);
	assert.equal(doc.elements.workspace.hidden, false);
	assert.equal(doc.elements['catalogue-loading'].hidden, true);
	await doc.elements['catalogue-retry'].handlers.click();
	assert.equal(starts, 1, 'Workspace initialised once');

	const retryDoc = fakeDocument();
	let attempts = 0;
	await start(retryDoc, () => { starts++; }, async () => { if (!attempts++) throw Error('HTTP 503'); });
	assert.equal(retryDoc.elements.workspace.hidden, true);
	assert.equal(retryDoc.elements['catalogue-error'].textContent, 'HTTP 503');
	assert.equal(retryDoc.elements['catalogue-retry'].hidden, false);
	await retryDoc.elements['catalogue-retry'].handlers.click();
	assert.equal(retryDoc.elements.workspace.hidden, false);
	const fileDoc = fakeDocument('file:');
	await start(fileDoc, () => { throw Error('must not start'); }, () => { throw Error('must not fetch'); });
	assert.match(fileDoc.elements['catalogue-error'].textContent, /HTTP server/);
	const brokenDoc = fakeDocument();
	await start(brokenDoc, () => { throw Error('Chart unavailable'); }, async () => {});
	assert.equal(brokenDoc.elements['catalogue-retry'].textContent, 'Reload page');
	await brokenDoc.elements['catalogue-retry'].handlers.click();
	assert.equal(brokenDoc.defaultView.location.reloaded, true);

	const server = http.createServer((request, result) => {
		if (request.url !== '/public/tubes.json') { result.writeHead(404); result.end(); return; }
		result.setHeader('Content-Type', 'application/json'); result.end(JSON.stringify(data));
	});
	await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
	try {
		const runtime = context({fetch: (url, options) => fetch('http://127.0.0.1:' + server.address().port + '/public/' + url, options)});
		await vm.runInContext('loadValveCatalogue()', runtime);
		assert.equal(vm.runInContext('valveCatalogue.devices.length', runtime), 15);
	} finally { await new Promise(resolve => server.close(resolve)); }
	for (const page of ['designer','characteristics','modelling']) {
		const html = fs.readFileSync(path.join(root,'public',page+'.html'),'utf8');
		assert.match(html, /<main id="workspace"[^>]*hidden/);
		assert.ok(html.indexOf('workspace-startup.js') > html.indexOf(page === 'designer' ? 'designer-workspace.js' : 'tools-workspace.js'));
		assert.ok(html.includes('id="catalogue-retry"'));
	}
	console.log('PASS: delayed/shared HTTP load, cache, timeout, network/HTTP/JSON/schema errors, atomic validation, retry, startup gating, route preservation, file URL guidance and all page bootstraps.');
})().catch(error => { console.error(error); process.exitCode = 1; });
