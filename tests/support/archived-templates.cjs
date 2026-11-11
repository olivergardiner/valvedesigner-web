const fs = require('node:fs');
const path = require('node:path');
module.exports = function archivedTemplates(root) {
	const markdown = fs.readFileSync(path.join(root, 'docs/design/fitting-template-archive.md'), 'utf8');
	const match = markdown.match(/```javascript\r?\n([\s\S]*?)\r?\n```/);
	if (!match) throw new Error('Archived fitting templates are missing.');
	return match[1];
};
