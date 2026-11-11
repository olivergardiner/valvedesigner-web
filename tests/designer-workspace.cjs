const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.join(__dirname, '..');
const context = vm.createContext({structuredClone});
for (const file of ['curves','plotting','designer','calculations/common','calculations/triodecc','calculations/pentodecc','calculations/followers','calculations/outputstage','tubes','circuit-definitions','designer-workspace']) {
	vm.runInContext(file === 'tubes' ? require('./support/archived-catalogue.cjs')(root) : fs.readFileSync(path.join(root,'public',file+'.js'),'utf8'),context);
}
function compare(actual, expected, label) {
	if (typeof expected === 'number') {
		assert.ok(Number.isFinite(actual),label+' finite');
		assert.ok(Math.abs(actual-expected)<=1e-10+Math.abs(expected)*1e-12,label+' numerical match');
	} else if (expected && typeof expected === 'object') {
		assert.deepEqual(Object.keys(actual).sort(),Object.keys(expected).sort(),label+' keys');
		for (const key of Object.keys(expected)) compare(actual[key],expected[key],label+'.'+key);
	} else assert.equal(actual,expected,label);
}
const fixtures=JSON.parse(fs.readFileSync(path.join(root,'tests/fixtures/numerical-baseline.json'),'utf8')).cases.filter(item=>item.type==='TriodeCC');
for (const fixture of fixtures) {
	context.fixture=fixture;
	const actual=vm.runInContext(`(() => {
		const session=new DesignerSession(designerCircuitDefinitions);
		const definition=session.definition('triodecc');
		const state=session.state('triodecc');
		state.deviceIndex=definition.devices().findIndex(device=>device.name===fixture.definition.name);
		definition.parameters.forEach((parameter,index)=>state.inputs[parameter.key]=String(fixture.parameters[index]/parameter.scale));
		const {device,result}=session.calculate('triodecc');
		return {outputs:definition.outputs.map(output=>designerResultValue(result,output.path).toFixed(3)),
			curves:designerChartConfig(device,result,definition).data.datasets.map(dataset=>dataset.data)};
	})()`,context);
	assert.deepEqual(Array.from(actual.outputs),Object.values(fixture.outputs),fixture.name+' workspace values');
	const curves=[...fixture.curves.operating,...fixture.curves.power,...fixture.curves.anode].map(series=>series.data);
	compare(JSON.parse(JSON.stringify(actual.curves)),curves,fixture.name+' chart coordinates');
}
vm.runInContext(`(() => {
	const session=new DesignerSession(designerCircuitDefinitions);
	const state=session.state('triodecc');
	if(state.inputs.cathodeResistance!=='1' || state.inputs.anodeResistance!=='100' || state.inputs.loadResistance!=='1000')throw Error('Incorrect kΩ display conversion');
	const before=JSON.stringify(smallSignalTriodes);
	state.deviceIndex=1;
	state.inputs.cathodeResistance='1.5';
	const first=session.calculate('triodecc');
	const second=session.calculate('triodecc');
	if(JSON.stringify(first)!==JSON.stringify(second))throw Error('State leaked between calculations');
	if(JSON.stringify(smallSignalTriodes)!==before)throw Error('Catalogue mutated');
	for(const raw of ['', ' ', '0', '-1', 'Infinity', '12junk', '1e309']) {
		state.inputs.supplyVoltage=raw;
		let rejected=false;
		try{session.calculate('triodecc');}catch(error){rejected=error instanceof RangeError;}
		if(!rejected)throw Error('Invalid displayed input accepted: '+raw);
		if(session.state('triodecc').inputs.supplyVoltage!==raw)throw Error('Raw edit lost');
	}
	session.resetParameters('triodecc');
	if(state.deviceIndex!==1 || state.inputs.supplyVoltage!=='300' || state.inputs.cathodeResistance!=='1')throw Error('Reset changed model or failed to restore values');
	state.deviceIndex=-1;
	let rejected=false;
	try{session.calculate('triodecc');}catch(error){rejected=error instanceof RangeError;}
	if(!rejected)throw Error('Invalid model accepted');
})()`,context);
const routes=[['','circuit'],['#triodecc','circuit'],['#circuits','directory'],['#unknown','unknown'],['#%','unknown'],['#pentodecc','circuit']];
for (const [hash,kind] of routes) {
	context.hash=hash;
	assert.equal(vm.runInContext('resolveDesignerRoute(hash).kind',context),kind,hash+' route');
}
const html=fs.readFileSync(path.join(root,'public/designer.html'),'utf8');
for (const match of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
	if(!/^(https?:|#)/.test(match[1]))assert.ok(fs.existsSync(path.join(root,'public',match[1].split('#')[0])),match[1]+' exists');
}
assert.ok(!/id="field\d+"/.test(html),'new page must not contain numbered field slots');
assert.ok(!/jquery/i.test(html),'new workspace does not require jQuery');
const links=vm.runInContext('designerCalculatorLinks.map(link=>link.href)',context);
for (const href of links)if(!href.startsWith('#'))assert.ok(fs.existsSync(path.join(root,'public',href)),href+' existing calculator');
console.log('PASS: workspace kΩ conversion and three frozen triode cases (all outputs/chart coordinates), edit/reset state, catalogue isolation, input/model rejection, routes and local assets.');
// Every migrated circuit must preserve its frozen numerical values and plot coordinates.
const circuitFixtures=JSON.parse(fs.readFileSync(path.join(root,'tests/fixtures/circuit-calculations.json'),'utf8'));
for(const fixture of circuitFixtures) {
	const [id,source,rawParameters]=fixture.name.split(' ');
	context.caseId=id;context.source=source;context.rawParameters=rawParameters.split(',').map(Number);
	const actual=vm.runInContext(`(() => {
		const session=new DesignerSession(designerCircuitDefinitions);
		const definition=session.definition(caseId);
		const state=session.state(caseId);
		const reference=eval(source);
		state.deviceIndex=definition.devices().findIndex(device=>device.name===reference.name);
		if(state.deviceIndex<0)throw Error('Reference device missing from '+caseId);
		definition.parameters.forEach((parameter,index)=>state.inputs[parameter.key]=String(rawParameters[index]/parameter.scale));
		const {device,result}=session.calculate(caseId);
		return {values:definition.outputs.map(output=>designerResultValue(result,output.path).toFixed(3)),
			curves:designerChartConfig(device,result,definition).data.datasets.map(dataset=>dataset.data)};
	})()`,context);
	assert.deepEqual(Array.from(actual.values),Object.values(fixture.outputs),fixture.name+' migrated outputs');
	compare(JSON.parse(JSON.stringify(actual.curves)),[...fixture.curves.operating,...fixture.curves.power,...fixture.curves.anode],fixture.name+' migrated curves');
}
vm.runInContext(`(() => {
	const session=new DesignerSession(designerCircuitDefinitions);
	const snapshots={};
	for(const definition of designerCircuitDefinitions) {
		const state=session.state(definition.id);
		state.deviceIndex=1;
		state.inputs.supplyVoltage=String(310+Object.keys(snapshots).length);
		snapshots[definition.id]=JSON.stringify(state);
	}
	for(const definition of [...designerCircuitDefinitions].reverse()) {
		if(JSON.stringify(session.state(definition.id))!==snapshots[definition.id])throw Error('Circuit switch lost state');
		if(resolveDesignerRoute('#'+definition.id).kind!=='circuit')throw Error('Circuit route is not shared');
	}
	for(const id of ['singleended-ul','pushpull-ul']) {
		const state=session.state(id);
		session.resetParameters(id);
		for(const tap of ['0','100']) {state.inputs.screenTap=tap;session.calculate(id);}
		for(const tap of ['-1','101','']) {
			state.inputs.screenTap=tap;
			let rejected=false;
			try{session.calculate(id);}catch(error){rejected=error instanceof RangeError;}
			if(!rejected)throw Error('Invalid screen percentage accepted');
		}
	}
	const triode=session.state('triodecc');
	triode.inputs.supplyVoltage='';
	session.state('pentodecc');
	if(session.state('triodecc').inputs.supplyVoltage!=='')throw Error('Invalid edit lost on switch');
	const pentodeBefore=JSON.stringify(session.state('pentodecc'));
	session.resetParameters('triodecc');
	if(JSON.stringify(session.state('pentodecc'))!==pentodeBefore)throw Error('Reset affected another circuit');
	for(const definition of designerCircuitDefinitions) {
		if(!definition.help.length || !definition.schematic)throw Error('Missing circuit help or schematic');
	}
})()`,context);
for(const definition of vm.runInContext('designerCircuitDefinitions',context)) {
	assert.ok(fs.existsSync(path.join(root,'public',definition.schematic)),definition.id+' schematic');
	const redirect=fs.readFileSync(path.join(root,'public',definition.id+'.html'),'utf8');
	assert.ok(redirect.includes("window.location.replace('designer.html#"+definition.id+"')"),definition.id+' replaces old URL');
	assert.ok(redirect.includes('href="designer.html#'+definition.id+'"'),definition.id+' fallback link');
}
assert.equal(vm.runInContext('designerCircuitDefinitions.length',context),8);
assert.equal(vm.runInContext("designerCircuitDefinitions.find(def=>def.id==='singleended').resultNote.includes('inaccurate')",context),true);
assert.equal(vm.runInContext("designerCircuitDefinitions.find(def=>def.id==='dccathodefollower').series.filter(series=>series.point).length",context),2);
console.log('PASS: twenty migrated workspace baselines, eight independent circuit states/routes, percent tap endpoints/ranges, circuit assets/help and all old-URL redirects.');
