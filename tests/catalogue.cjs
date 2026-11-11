const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const context = vm.createContext({});
vm.runInContext(fs.readFileSync(path.join(__dirname, '../public/tubes.js'), 'utf8'), context);
const tubes = JSON.parse(vm.runInContext('JSON.stringify([...smallSignalTriodes, ...smallSignalPentodes, ...powerTriodes, ...powerPentodes])', context));
const fields = ['vaMax', 'vg1Max', 'vg1Step', 'vg2Max', 'iaMax', 'paMax'];
const groups = new Map();
for (const tube of tubes) {
	const device = tube.name.split(' (')[0];
	if (!groups.has(device)) groups.set(device, []);
	groups.get(device).push(tube);
}
for (const [device, variants] of groups) {
	for (const variant of variants.slice(1)) {
		for (const field of fields) assert.equal(variant[field], variants[0][field], variant.name + ' ' + field + ' matches ' + device);
	}
}
const ef86 = groups.get('EF86');
for (const tube of ef86) assert.deepEqual(fields.map(field => tube[field]), [300, 5, 0.5, 200, 7, 1], tube.name + ' Gardiner ranges');
assert.equal(groups.get('EL84').find(tube => tube.model.type === 'simple').iaMax, 200);
assert.equal(groups.get('EL84').find(tube => tube.model.type === 'simple').vg2Max, 300);
assert.deepEqual(tubes.map(tube => tube.name), ['12AX7','12AY7','12AT7','12AU7','6SL7','6SN7','EF86','EF37A','EL84','6F6','EL34','6L6GC','6550','KT88','GU50']);
assert.equal(new Set(tubes.map(tube => tube.name)).size, tubes.length);
const archive = vm.createContext({});
vm.runInContext(require('./support/archived-catalogue.cjs')(path.join(__dirname, '..')), archive);
const archived = JSON.parse(vm.runInContext('JSON.stringify([...smallSignalTriodes,...smallSignalPentodes,...powerPentodes])', archive));
assert.equal(archived.length, 25);
for (const tube of tubes) {
	const original = archived.find(old => old.name === (tube.name === '6SN7' ? tube.name : tube.name + (tube.model.device === 'triode' ? ' (Cohen Helie - DS)' : ['EF86','EF37A'].includes(tube.name) ? ' (Simple V2)' : ' (Simple)')));
	assert.ok(original, tube.name + ' archived source exists');
	assert.deepEqual(tube, {...original, name: tube.name}, tube.name + ' only renamed');
}
const runtime = vm.createContext({structuredClone});
for (const source of ['curves','plotting','designer','calculations/common','calculations/triodecc','calculations/pentodecc','calculations/followers','calculations/outputstage','tubes','circuit-definitions','designer-workspace']) vm.runInContext(fs.readFileSync(path.join(__dirname, '../public', source + '.js'), 'utf8'), runtime);
const count = vm.runInContext(`(() => {
	let count = 0;
	const failures = [];
	const session = new DesignerSession(designerCircuitDefinitions);
	for (const definition of designerCircuitDefinitions) {
		for (let index = 0; index < definition.devices().length; index++) {
			session.state(definition.id).deviceIndex = index;
			let result;
			try { result = session.calculate(definition.id).result; }
			catch (error) {
				if (!(error instanceof RangeError)) throw error;
				failures.push([definition.id, definition.devices()[index].name, error.message]);
				continue;
			}
			for (const output of definition.outputs) if (!Number.isFinite(designerResultValue(result, output.path))) throw Error(definition.id + ' non-finite output');
			count++;
		}
	}
	return {count, failures};
})()`, runtime);
const inverseFailure = 'Inverse model returned a non-finite voltage.';
const intersectionFailure = 'No output power-limit intersection within the sampled range.';
assert.deepEqual(JSON.parse(JSON.stringify(count.failures)), [
	...['triodecc','accathodefollower','dccathodefollower'].map(id => [id, '12AT7', inverseFailure]),
	...['EL34','KT88','GU50'].map(name => ['singleended', name, intersectionFailure]),
	...['KT88','GU50'].map(name => ['singleended-ul', name, intersectionFailure]),
	...['KT88','GU50'].map(name => ['pushpull', name, intersectionFailure])
]);
assert.equal(count.count, 38);
console.log('PASS: 25 archived definitions, 15 unique datasheet models preserved apart from names, agreed ranges, 38 finite live calculations and 10 explicit default-setting failures.');
