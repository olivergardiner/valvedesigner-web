const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const root = path.join(__dirname, '..');
const cases = [
 ['triodecc','TriodeCC','smallSignalTriodes[0]'],
 ['pentodecc','PentodeCC','smallSignalPentodes[0]'],
 ['accathodefollower','ACCathodeFollower','smallSignalTriodes[0]'],
 ['dccathodefollower','DCCathodeFollower','smallSignalTriodes[0]'],
 ['singleended','SingleEnded','powerPentodes[0]'],
 ['singleended-ul','SingleEndedUL','powerPentodes[0]'],
 ['pushpull','PushPull','powerPentodes[0]'],
 ['pushpull-ul','PushPullUL','powerPentodes[0]'],
 ['characteristics','Characteristics','smallSignalTriodes[0]'],
 ['characteristics','Characteristics','powerPentodes[0]'],
 ['triodemodeller','TriodeModeller','triodes[0]'],
 ['pentodemodeller','PentodeModeller','pentodes[0]']
];
function canonical(value) {
 if (typeof value === 'number' && !Number.isFinite(value)) return String(value);
 if (Array.isArray(value)) return value.map(canonical);
 if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map(key=>[key,canonical(value[key])]));
 return value;
}
const snapshots = cases.map(([file,type,definition]) => {
 const elements = {};
 const charts = [];
 const context = vm.createContext({structuredClone,
  $: selector => ({
   text(value) {(elements[selector] ??= {}).text = value;},
   val(value) {const element = elements[selector] ??= {}; if (value === undefined) return element.value; element.value=value;},
   show() {},hide() {},append() {},css() {}
  }),
  Chart: class {constructor(ctx,config) {charts.push(config);} destroy() {}}
 });
 for (const source of ['curves','plotting','designer','calculations/common','calculations/triodecc','calculations/pentodecc','calculations/followers','calculations/outputstage','calculatedcircuit','circuit-definitions','tubes','templates',file]) {
  vm.runInContext(source === 'tubes' ? require('./support/archived-catalogue.cjs')(root) : fs.readFileSync(path.join(root,'public',source+'.js'),'utf8'),context);
 }
 vm.runInContext(`circuit = new ${type}({}, {}); circuit.configureParameters(); circuit.loadSingleDevice(structuredClone(${definition}));`,context);
 const result = vm.runInContext(`({charts: null, export: typeof circuit.createJSON === 'function' ? circuit.createJSON() : null})`,context);
 const snapshot = {charts,elements,export:result.export};
 return {name:file+' '+definition,sha256:crypto.createHash('sha256').update(JSON.stringify(canonical(snapshot))).digest('hex')};
});
assert.deepEqual(snapshots, JSON.parse(fs.readFileSync(path.join(root,'tests/fixtures/plot-baseline.json'),'utf8')));
console.log('PASS: '+snapshots.length+' frozen chart/output/export snapshots match exactly.');
// Shared sampling contracts: preserve legacy origin handling and endpoint counts.
const curveContext = vm.createContext({});
vm.runInContext(fs.readFileSync(path.join(root,'public/curves.js'),'utf8'),curveContext);
const contracts = vm.runInContext(`(() => {
 const calls = [];
 const model = {anodeCurrent(va, vg, vs) {calls.push([va,vg,vs]); return vs / 1000;}};
 const seeded = sampleAnodeCurve(model, 300, -2, voltage => voltage * 0.3 + 300 * 0.7, {seedOrigin:true});
 const sampledCalls = calls.slice();
 const direct = sampleAnodeCurve(model,300,-2,250);
 const noOrigin = sampleAnodeCurve(model,300,-2,250,{startIndex:1});
 const family = sampleGridFamily(1,2,0.5,grid=>[{x:grid,y:0}]);
 const power = sampleDissipationCurve({paMax:1,iaMax:5,vaMax:300});
 const line = sampleLoadLine(300,3);
 const rejected = [0,-1,NaN,Infinity].every(step => {
  try {sampleGridFamily(0,5,step,()=>[]);return false;} catch(error) {return error instanceof RangeError;}
 });
 return {seeded,sampledCalls,direct,noOrigin,family,power,line,rejected,
  noPower:sampleDissipationCurve({paMax:0,iaMax:5,vaMax:300})};
})()`,curveContext);
assert.equal(contracts.seeded.length,101);
assert.equal(contracts.sampledCalls.length,100);
assert.equal(contracts.seeded[0].y,0);
assert.equal(contracts.sampledCalls[0][0],3);
assert.equal(contracts.sampledCalls[99][2],300);
assert.equal(contracts.direct[0].y,250); // Origin evaluated rather than forced to zero.
assert.equal(contracts.noOrigin.length,100);
assert.deepEqual(Array.from(contracts.family,curve=>curve.gridVoltage),[1,1.5,2]);
assert.equal(contracts.power.length,100);
assert.equal(contracts.power[0].x,200);
assert.equal(contracts.power[99].x,299);
assert.equal(contracts.line[0].y,3);
assert.equal(contracts.line[100].x,300);
assert.equal(contracts.line[100].y,0);
assert.equal(contracts.noPower.length,0);
assert.ok(contracts.rejected);
for (const [file] of cases) {
 const html=fs.readFileSync(path.join(root,'public',file==='characteristics' ? 'characteristics.html' : file.endsWith('modeller') ? 'modelling.html' : 'designer.html'),'utf8');
 const sources=[...html.matchAll(/<script (?:defer )?src="([^"]+)"><\/script>/g)].map(match=>match[1]);
 assert.ok(sources.indexOf('curves.js') >= 0 && sources.indexOf('curves.js') < sources.indexOf('designer.js'),file+' curve dependency order');
 assert.ok(sources.indexOf('plotting.js') >= 0 && sources.indexOf('plotting.js') < sources.indexOf('designer.js'),file+' plotting dependency order');
}
console.log('PASS: sampling origins/endpoints, ultralinear screen callback, mA scaling, invalid grid steps and HTML dependency order.');
