const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
module.exports = function installCatalogue(root, context) {
	const data = JSON.parse(fs.readFileSync(path.join(root, 'public/tubes.json'), 'utf8'));
	vm.runInContext('installValveCatalogue(' + JSON.stringify(data) + ')', context);
};
