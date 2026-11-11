/** Retired numbered-field adapters remain regression oracles after URL migration. */
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
module.exports = function loadRetiredAdapters(root, context) {
	for (const source of ['curves','plotting','designer','calculations/common','calculations/triodecc','calculations/pentodecc','calculations/followers','calculations/outputstage','calculatedcircuit','tubes','circuit-definitions','triodecc','pentodecc','accathodefollower','dccathodefollower','singleended','singleended-ul','pushpull','pushpull-ul']) {
		vm.runInContext(source === 'tubes' ? require('./archived-catalogue.cjs')(root) : fs.readFileSync(path.join(root,'public',source+'.js'),'utf8'),context);
	}
};
