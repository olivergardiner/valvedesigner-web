/** Historical numerical fixtures retain their exact, now archived, input models. */
const fs = require('node:fs');
const path = require('node:path');
module.exports = function archivedCatalogue(root) {
	const markdown = fs.readFileSync(path.join(root, 'docs/design/model-catalogue-archive.md'), 'utf8');
	const match = markdown.match(/```javascript\r?\n([\s\S]*?)\r?\n```/);
	if (!match) throw new Error('Archived catalogue source block is missing.');
	return match[1];
};
