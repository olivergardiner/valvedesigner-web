/** Keep all three workspaces unavailable until valid tube data is ready. */
function startValveWorkspace(document, initialise, load = loadValveCatalogue) {
	const workspace = document.getElementById('workspace');
	const panel = document.getElementById('catalogue-loading');
	const status = document.getElementById('catalogue-status');
	const error = document.getElementById('catalogue-error');
	const retry = document.getElementById('catalogue-retry');
	let busy = false;
	let ready = false;
	let initialisationFailed = false;
	async function run() {
		if (busy || ready) return;
		if (initialisationFailed) { document.defaultView.location.reload(); return; }
		busy = true;
		workspace.hidden = true;
		workspace.setAttribute('aria-busy', 'true');
		panel.hidden = false;
		status.textContent = 'Loading valve models…';
		error.hidden = true;
		retry.hidden = true;
		try {
			if (document.defaultView.location.protocol === 'file:') throw new Error('Serve this folder with Live Server or another local HTTP server to load tubes.json.');
			await load();
			// Let responsive charts measure their containers during initialisation.
			workspace.hidden = false;
			try { initialise(); }
			catch (issue) { initialisationFailed = true; throw issue; }
			ready = true;
			workspace.hidden = false;
			workspace.setAttribute('aria-busy', 'false');
			panel.hidden = true;
		} catch (issue) {
			workspace.hidden = true;
			status.textContent = initialisationFailed ? 'Unable to start this workspace' : 'Unable to load valve models';
			error.textContent = issue.message || 'Check your connection and local server, then retry.';
			error.hidden = false;
			retry.textContent = initialisationFailed ? 'Reload page' : 'Retry loading';
			retry.hidden = false;
		} finally { busy = false; }
	}
	retry.addEventListener('click', run);
	return run();
}

var circuit;
if (typeof document !== 'undefined') {
	startValveWorkspace(document, () => {
		if (document.body.dataset.tool) new ToolsWorkspace().start();
		else {
			circuit = new DesignerWorkspace(document, window);
			circuit.start();
		}
	});
}
