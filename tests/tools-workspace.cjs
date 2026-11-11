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
	for (const file of ['curves', 'plotting', 'designer', 'tubes', 'templates', 'characteristics', 'triodemodeller', 'pentodemodeller', 'tools-workspace']) vm.runInContext(fs.readFileSync(path.join(root, 'public', file + '.js'), 'utf8'), ctx);
	return ctx;
}
const ctx = context();
vm.runInContext(`
if (toolParameterIssue(['0','5','.5','300','5','1'])) throw Error('Valid chart rejected');
for (const fields of [['0','5','0','300','5','1'], ['0','5','.001','300','5','1'], ['2','1','.5','300','5','1'], ['0','5','.5','','5','1']]) {
	if (!toolParameterIssue(fields)) throw Error('Invalid sweep accepted');
}
if (!toolParameterIssue(['0','5','.5','300','5','1'], ['250','2','0','100'])) throw Error('Zero reference current accepted');
if (toolParameterIssue(['0','5','.5','300','5','1'], ['250','0','1','100'])) throw Error('Zero grid bias rejected');
`, ctx);
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
	for (const match of html.matchAll(/(?:src|href)="([^"]+)"/g)) if (!/^(https?:|#)/.test(match[1])) assert.ok(fs.existsSync(path.join(root, 'public', match[1].split('#')[0])), match[1]);
}
for (const mode of ['triode', 'pentode']) assert.ok(fs.readFileSync(path.join(root, 'public', mode + 'modeller.html'), 'utf8').includes("window.location.replace('modelling.html#" + mode + "')"));
console.log('PASS: tools validation, edited fitter coefficients/chart data, viewer export, local assets and legacy redirects.');
