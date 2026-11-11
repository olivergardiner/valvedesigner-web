const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.join(__dirname, '..');
const cases = [
 ['triodecc','TriodeCC','smallSignalTriodes[0]',[300,1000,100000,1000000]],
 ['triodecc','TriodeCC','smallSignalTriodes[4]',[250,1500,47000,220000]],
 ['pentodecc','PentodeCC','smallSignalPentodes[0]',[280,680,82000,300000,1000000]],
 ['pentodecc','PentodeCC','smallSignalPentodes[1]',[250,1000,100000,330000,470000]],
 ['accathodefollower','ACCathodeFollower','smallSignalTriodes[0]',[300,620,47000,100000]],
 ['accathodefollower','ACCathodeFollower','smallSignalTriodes[4]',[250,470,22000,47000]],
 ['dccathodefollower','DCCathodeFollower','smallSignalTriodes[0]',[300,1500,100000,82000]],
 ['dccathodefollower','DCCathodeFollower','smallSignalTriodes[7]',[280,1000,82000,100000]],
 ['singleended','SingleEnded','powerPentodes[0]',[300,250,30,8000]],
 ['singleended','SingleEnded','powerPentodes[8]',[350,250,45,5000]],
 ['singleended-ul','SingleEndedUL','powerPentodes[0]',[300,0.5,30,8000]],
 ['singleended-ul','SingleEndedUL','powerPentodes[8]',[350,0.4,45,5000]],
 ['pushpull','PushPull','powerPentodes[0]',[300,250,30,8000]],
 ['pushpull','PushPull','powerPentodes[8]',[350,250,35,6600]],
 ['pushpull-ul','PushPullUL','powerPentodes[0]',[300,0.3,30,8000]],
 ['pushpull-ul','PushPullUL','powerPentodes[8]',[350,0.4,35,6600]],
 ['singleended-ul','SingleEndedUL','powerPentodes[0]',[300,0,30,8000]],
 ['singleended-ul','SingleEndedUL','powerPentodes[0]',[300,1,30,8000]],
 ['pushpull-ul','PushPullUL','powerPentodes[0]',[300,0,30,8000]],
 ['pushpull-ul','PushPullUL','powerPentodes[0]',[300,1,30,8000]]
];
function loadPage(file, context) {
 require('./support/retired-adapters.cjs')(root, context);
}

const snapshots=cases.map(([file,type,definition,parameters],index)=> {
 const outputs={};
 const context=vm.createContext({structuredClone,$:selector=>({text(value){if(/^#value\d+$/.test(selector))outputs[selector]=value;},show(){},hide(){}})});
 loadPage(file,context);
 context.inputs=parameters;
 const curves=vm.runInContext(`(() => {
 const circuit=new ${type}(null);
 inputs.forEach((value,i)=>circuit.parameters.field[i].value=value);
 circuit.device=new Device(structuredClone(${definition}));
 circuit.drawChart=()=>{};
 circuit.showPlots();
 return {operating:circuit.operatingPointCurves.map(series=>series.data),anode:circuit.anodeCurves.map(series=>series.data),power:circuit.anodePowerCurve.map(series=>series.data)};
 })()`,context);
 assert.ok(Object.keys(outputs).length>0,'case '+index+' produced no results');
 return {name:file+' '+definition+' '+parameters.join(','),outputs,curves};
});

const expected=JSON.parse(fs.readFileSync(path.join(root,'tests/fixtures/circuit-calculations.json'),'utf8'));
function compare(actual,expected,label) {
 if(typeof expected==='number') {
  assert.ok(Number.isFinite(actual),label+' must be finite');
  assert.ok(Math.abs(actual-expected)<=1e-10+Math.abs(expected)*1e-12,label+': '+actual+' != '+expected);
 } else if(expected && typeof expected==='object') {
  assert.deepEqual(Object.keys(actual).sort(),Object.keys(expected).sort(),label+' keys');
  for(const key of Object.keys(expected)) compare(actual[key],expected[key],label+'.'+key);
 } else assert.equal(actual,expected,label);
}
compare(JSON.parse(JSON.stringify(snapshots)),expected,'circuits');
console.log('PASS: '+snapshots.length+' pre-consolidation circuit cases, every plotted point and displayed output.');
// Run every calculator directly in a context without DOM, jQuery or Chart.js.
for (const [file,type,definition,values] of cases) {
 const context=vm.createContext({structuredClone});
 loadPage(file,context);
 context.values=values;
 const result=vm.runInContext(`(() => {
 const adapter=new ${type}(null);
 const device=new Device(structuredClone(${definition}));
 const parameters=Object.fromEntries(adapter.parameterKeys.map((key,index)=>[key,values[index]]));
 const before=JSON.stringify({definition:device.definition,parameters});
 const first=adapter.calculation(device,parameters);
 const second=adapter.calculation(device,parameters);
 if(before!==JSON.stringify({definition:device.definition,parameters})) throw Error('Calculation mutated inputs');
 if(JSON.stringify(first)!==JSON.stringify(second)) throw Error('Calculation retained state');
 function rejects(run) {
  try {run();} catch(error) {if(error instanceof RangeError) return; throw error;}
  throw Error('Invalid calculation was accepted');
 }
 for(const value of [0,-1,NaN,Infinity]) rejects(()=>adapter.calculation(device,{...parameters,supplyVoltage:value}));
 rejects(()=>adapter.calculation(device,{}));
 if('screenTap' in parameters) {
  for(const screenTap of [-0.1,1.1,NaN]) rejects(()=>adapter.calculation(device,{...parameters,screenTap}));
 }
 device.definition.vg1Step=0;
 rejects(()=>adapter.calculation(device,parameters));
 device.definition.vg1Step=0.5;
 if(device.definition.model.device==='triode') {
  device.model.anodeVoltage=()=>10000;
  rejects(()=>adapter.calculation(device,parameters));
  device.model.anodeVoltage=()=>NaN;
  rejects(()=>adapter.calculation(device,parameters));
 } else if('${file}'==='pentodecc') {
  device.model.screenVoltage=()=>10000;
  rejects(()=>adapter.calculation(device,parameters));
  device.model.screenVoltage=()=>NaN;
  rejects(()=>adapter.calculation(device,parameters));
 } else {
  device.model.anodeCurrent=()=>0;
  rejects(()=>adapter.calculation(device,parameters));
  device.model.anodeCurrent=()=>NaN;
  rejects(()=>adapter.calculation(device,parameters));
 }
 device.definition.model.device='unsupported';
 rejects(()=>adapter.calculation(device,parameters));
 return {first,outputs:adapter.outputPaths.map(path=>path.split('.').reduce((value,key)=>value[key],first).toFixed(3))};
 })()`,context);
 const reference=expected[cases.findIndex(entry=>entry[0]===file && entry[2]===definition && entry[3]===values)];
 assert.deepEqual(Array.from(result.outputs),Object.values(reference.outputs),file+' direct outputs');
}
console.log('PASS: all circuit functions run without browser globals, preserve inputs, repeat deterministically and reject invalid/no-solution cases.');

// Exercise shared adapter failure/recovery using the retired adapter dependency set.
for(const [file,type,definition] of cases.slice(0,16).filter((entry,index)=>index%2===0)) {
 const elements=new Map();
 let chartCount=0;
 const context=vm.createContext({structuredClone,
  $:selector=>{
   if(!elements.has(selector))elements.set(selector,{});
   const element=elements.get(selector);
   return {text(value){element.text=value;},val(value){if(value===undefined)return element.value;element.value=value;},show(){element.visible=true;},hide(){element.visible=false;},append(){}};
  },
  Chart:class{constructor(){chartCount++;}destroy(){chartCount--;}}
 });
 loadPage(file,context);
 vm.runInContext(`circuit=new ${type}({});circuit.configureParameters();circuit.loadSingleDevice(structuredClone(${definition}));`,context);
 assert.equal(chartCount,1,file+' startup');
 elements.get('#field1').value='0';
 vm.runInContext('circuit.updateParameters()',context);
 assert.equal(chartCount,0,file+' clears old chart');
 assert.ok(elements.get('#calculationError').text.includes('positive'),file+' failure message');
 assert.equal(elements.get('#calculationError').visible,true);
 assert.equal(elements.get('#value1').text,'\u2014');
 assert.equal(vm.runInContext('circuit.result',context),null);
 elements.get('#field1').value='300';
 vm.runInContext('circuit.updateParameters()',context);
 assert.equal(chartCount,1,file+' recovery');
 assert.equal(elements.get('#calculationError').text,'');
 assert.equal(elements.get('#calculationError').visible,false);
}
console.log('PASS: eight retired adapters clear stale results/charts on failure and recover after corrected input (DOM/chart stand-ins).');
