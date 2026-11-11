const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.join(__dirname, '..');
function context() {
	const elements = {};
	const ctx = vm.createContext({structuredClone, $: selector => ({
		val(value) { if (value === undefined) return elements[selector]; elements[selector] = value; },
		text() {}, show() {}, hide() {}, css() {}
	})});
	for (const file of ['curves', 'plotting', 'designer', 'tubes', 'templates', 'characteristics', 'triodemodeller', 'pentodemodeller', 'tools-workspace']) vm.runInContext(file === 'templates' ? require('./support/archived-templates.cjs')(root) : fs.readFileSync(path.join(root, 'public', file + '.js'), 'utf8'), ctx);
	require('./support/install-catalogue.cjs')(root, ctx);
	return ctx;
}
const ctx = context();
vm.runInContext(`(() => {
	for (const entry of valveCatalogue.devices) {
		const adapter = entry.model.device === 'triode' ? new TriodeModeller(null) : new PentodeModeller(null);
		adapter.drawChart = () => {};
		adapter.configureParameters();
		const before = JSON.stringify(entry);
		toolLoadFittingDevice(adapter, entry);
		if (JSON.stringify(adapter.device.definition.model) !== JSON.stringify(entry.model)) throw Error(entry.name + ' changed coefficients on load');
		if (JSON.stringify(entry) !== before) throw Error(entry.name + ' mutated catalogue');
		const exported = toolModelDefinition(adapter.device.definition, entry.display, {...entry.fitting}, entry.category);
		if (JSON.stringify(exported.model) !== JSON.stringify(entry.model) || JSON.stringify(exported.static) !== JSON.stringify(entry.static)) throw Error(entry.name + ' altered saved fit');
		if (exported.fitting.vaMax !== entry.fitting.vaMax || exported.display.vaMax !== entry.display.vaMax) throw Error(entry.name + ' lost independent axes');
		const restored = new Device(valveDisplayDefinition(exported));
		const original = new Device(valveDisplayDefinition(entry));
		for (const voltage of [50,150,250]) {
			const expected = original.model.anodeCurrent(voltage,-2,entry.static.vg2 || 0);
			if (restored.model.anodeCurrent(voltage,-2,entry.static.vg2 || 0) !== expected) throw Error(entry.name + ' export round trip changed current');
		}
	}
})()`, ctx);
vm.runInContext(`
if (toolParameterIssue(['0','5','.5','300','5','1'])) throw Error('Valid chart rejected');
for (const fields of [['0','5','0','300','5','1'], ['0','5','.001','300','5','1'], ['2','1','.5','300','5','1'], ['0','5','.5','','5','1']]) {
	if (!toolParameterIssue(fields)) throw Error('Invalid sweep accepted');
}
if (!toolParameterIssue(['0','5','.5','300','5','1'], ['250','2','0','100'])) throw Error('Zero reference current accepted');
if (toolParameterIssue(['0','5','.5','300','5','1'], ['250','0','1','100'])) throw Error('Zero grid bias rejected');
if (toolDisplayIssue({vaMax:300,iaMax:5,vg1Max:5,vg1Step:.5,paMax:1})) throw Error('Valid display settings rejected');
if (!toolDisplayIssue({vaMax:0})) throw Error('Zero display limit accepted');
if (!toolDisplayIssue({vg1Max:5,vg1Step:.001})) throw Error('Excessive display sweep accepted');
`, ctx);
for (const [type, template] of [['TriodeModeller','triodes[0]'],['PentodeModeller','pentodes[0]']]) {
	const runtime = context();
	vm.runInContext(`(() => {
		const adapter = new ${type}(null);
		adapter.drawChart = () => {};
		adapter.configureParameters(); adapter.loadDevice([${template}], 0);
		const before = JSON.stringify({definition:adapter.device.definition, curves:adapter.anodeCurves, fields:adapter.parameters});
		const display = {vaMax:300,iaMax:7,vg1Max:8,vg1Step:1,paMax:2,vg2Max:200};
		const exported = toolModelDefinition(adapter.device.definition, display);
		if (JSON.stringify({definition:adapter.device.definition, curves:adapter.anodeCurves, fields:adapter.parameters}) !== before) throw Error('Display export changed fitting state');
		if (exported.display.vaMax !== 300 || exported.display.iaMax !== 7 || exported.display.vg1Max !== 8 || exported.display.paMax !== 2) throw Error('Display settings missing from export');
		if (JSON.stringify(exported.model) !== JSON.stringify(adapter.device.definition.model) || JSON.stringify(exported.static) !== JSON.stringify(adapter.device.definition.static)) throw Error('Display settings changed model/static reference');
		$('#field4').val(450); $('#deviceName').val('Fitted valve'); adapter.updateParameters();
		if (toolModelDefinition(adapter.device.definition, display).display.vaMax !== 300 || adapter.device.definition.vaMax !== 450) throw Error('Fitting and display axes coupled');
	})()`, runtime);
}
for (const [type, template] of [['TriodeModeller', 'triodes[0]'], ['PentodeModeller', 'pentodes[0]'], ['Characteristics', 'powerPentodes[0]']]) {
	const results = [false, true].map(modern => {
		const runtime = context();
		runtime.modern = modern;
		return vm.runInContext(`(() => {
			const adapter = new ${type}(null);
			adapter.drawChart = () => {};
			adapter.configureParameters(); adapter.loadDevice([${template}], 0);
			if (adapter.parameters.field2) {
				$('#deviceName').val('Edited model');
				$('#field9').val(240);
				adapter.updateParameters();
				$('#kp').val(110);
				adapter.updateSliders();
			} else {
				$('#field4').val(350); adapter.updateParameters();
			}
			const datasets = adapter.anodePowerCurve.concat(adapter.anodeCurves);
			const config = modern ? toolChartConfig(adapter.device.definition, datasets) : characteristicChartConfig(adapter.device.definition, datasets, 'Legacy');
			return JSON.stringify({definition: adapter.device.definition, data: config.data, export: adapter.createJSON?.()});
		})()`, runtime);
	});
	assert.equal(results[0], results[1], type + ' edited chart/model/export preserved');
}
for (const page of ['characteristics.html', 'modelling.html']) {
	const html = fs.readFileSync(path.join(root, 'public', page), 'utf8');
	assert.ok(html.indexOf('id="pentode"') < html.indexOf('id="mainChart"'), page + ' fixed screen chart first');
	if (page === 'modelling.html') {
		assert.ok(html.indexOf('id="reference-panel"') < html.indexOf('id="display-panel"'), 'Static reference precedes display panel');
		assert.ok(html.includes('id="display-fields"'), 'Separate display controls');
	}
	for (const match of html.matchAll(/(?:src|href)="([^"]+)"/g)) if (!/^(https?:|#)/.test(match[1])) assert.ok(fs.existsSync(path.join(root, 'public', match[1].split('#')[0])), match[1]);
}
for (const mode of ['triode', 'pentode']) assert.ok(fs.readFileSync(path.join(root, 'public', mode + 'modeller.html'), 'utf8').includes("window.location.replace('modelling.html#" + mode + "')"));
console.log('PASS: tools validation, edited fitter coefficients/chart data, viewer export, local assets and legacy redirects.');
