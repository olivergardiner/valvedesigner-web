const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const path = require('node:path');
const root = path.join(__dirname, '..');
const context = vm.createContext({structuredClone});
for (const file of ['curves','plotting','designer', 'calculations/common', 'calculations/triodecc', 'calculations/pentodecc', 'calculations/followers', 'calculations/outputstage', 'calculatedcircuit','circuit-definitions', 'tubes', 'triodecc', 'pentodecc', 'singleended', 'pushpull']) {
 vm.runInContext(file === 'tubes' ? require('./support/archived-catalogue.cjs')(root) : fs.readFileSync(path.join(root,`public/${file}.js`), 'utf8'), context);
}
const cases = [
 ['12AX7 default','TriodeCC','smallSignalTriodes[0]',[300,1000,100000,1000000]],
 ['12AU7 altered','TriodeCC','smallSignalTriodes[4]',[250,1500,47000,220000]],
 ['6SL7 Ayumi','TriodeCC','smallSignalTriodes[7]',[300,1000,100000,1000000]],
 ['EF86 default','PentodeCC','smallSignalPentodes[0]',[280,680,82000,300000,1000000]],
 ['EL84 single ended','SingleEnded','powerPentodes[0]',[300,250,30,8000]],
 ['EL84 push pull','PushPull','powerPentodes[0]',[300,250,30,8000]]
];
const fixtures = cases.map(([name,type,device,parameters]) => {
 const outputs = {};
 context.$ = selector => ({text(value) {if (selector !== '#calculationError') outputs[selector] = value;},show() {},hide() {}});
 context.inputs = parameters;
 const result = vm.runInContext(`(() => {
 const circuit = new ${type}(null);
 circuit.device = new Device(structuredClone(${device}));
 inputs.forEach((value,i) => circuit.parameters.field[i].value = value);
 circuit.drawChart = () => {};
 circuit.showPlots();
 return {definition:circuit.device.definition, curves:{operating:circuit.operatingPointCurves,anode:circuit.anodeCurves,power:circuit.anodePowerCurve}};
 })()`, context);
 return {name,type,parameters,...result,outputs};
});

const baseline = JSON.parse(fs.readFileSync(path.join(root,'tests/fixtures/numerical-baseline.json'),'utf8'));
function compare(actual, expected, label) {
 if (typeof expected === 'number') {
  assert.ok(Number.isFinite(actual), label + ' must be finite');
  assert.ok(Math.abs(actual-expected) <= 1e-10 + Math.abs(expected)*1e-12, label + ': ' + actual + ' != ' + expected);
 } else if (expected && typeof expected === 'object') {
  assert.deepEqual(Object.keys(actual).sort(), Object.keys(expected).sort(), label + ' keys');
  for (const key of Object.keys(expected)) compare(actual[key],expected[key],label+'.'+key);
 } else assert.equal(actual,expected,label);
}
compare(JSON.parse(JSON.stringify(fixtures)), baseline.cases, 'baseline');
// Execute calculation with no DOM, jQuery or Chart globals available.
delete context.$;
vm.runInContext(`(() => {
 const device = new Device(structuredClone(smallSignalTriodes[0]));
 const before = JSON.stringify(device.definition);
 const parameters = {supplyVoltage:300,cathodeResistance:1000,anodeResistance:100000,loadResistance:1000000};
 const first = calculateTriodeCC(device, parameters);
 const second = calculateTriodeCC(device, parameters);
 if (JSON.stringify(first) !== JSON.stringify(second) || before !== JSON.stringify(device.definition)) throw Error('Calculation mutated device or retained state');
 for (const value of [0,-1,NaN,Infinity]) {
  let rejected = false;
  try { calculateTriodeCC(device,{...parameters,cathodeResistance:value}); } catch(error) { rejected = error instanceof RangeError; }
  if (!rejected) throw Error('Invalid resistance accepted');
 }
 device.definition.vg1Step = 0;
 try { calculateTriodeCC(device,parameters); throw Error('Invalid sweep accepted'); } catch(error) { if (!(error instanceof RangeError)) throw error; }
 device.definition.vg1Step = 0.5;
 device.model.anodeVoltage = () => NaN;
 try { calculateTriodeCC(device,parameters); throw Error('Non-finite inverse accepted'); } catch(error) { if (!(error instanceof RangeError)) throw error; }
 device.model.anodeVoltage = () => 10000;
 try { calculateTriodeCC(device,parameters); throw Error('Missing crossing accepted'); } catch(error) { if (!(error instanceof RangeError)) throw error; }
})()`,context);
console.log('PASS: six legacy baselines (all plotted points and displayed outputs), pure calculation determinism, input rejection and missing/non-finite solution cases.');

// Retired adapter smoke check with small DOM/chart stand-ins (not a browser test).
const elements = new Map();
context.$ = selector => {
 if (!elements.has(selector)) elements.set(selector, {});
 const element = elements.get(selector);
 return {text(value) {element.text=value;}, val(value) {if(value === undefined) return element.value; element.value=value;},show() {},hide() {},append() {}};
};
let charts = 0;
context.Chart = class {constructor() {charts++;} destroy() {charts--;}};
context.document = {getElementById() {return {};}};
context.buildMenu = () => {};
vm.runInContext("circuit = new TriodeCC({}); circuit.configureParameters(); circuit.loadDevice(smallSignalTriodes,0);",context);
assert.equal(charts,1);
assert.equal(elements.get('#value1').text,'1.323');
vm.runInContext("circuit.loadDevice(smallSignalTriodes,4)",context);
assert.equal(charts,1);
elements.get('#field2').value = '0';
vm.runInContext('circuit.updateParameters()',context);
assert.equal(charts,0);
assert.ok(elements.get('#calculationError').text.includes('positive'));
assert.equal(elements.get('#value1').text,'—');
elements.get('#field2').value = '1500';
vm.runInContext('circuit.updateParameters()',context);
assert.equal(charts,1);
assert.equal(elements.get('#calculationError').text,'');
console.log('PASS: retired triode adapter startup, valve switching, invalid-input display and recovery (DOM/chart stand-ins).');
