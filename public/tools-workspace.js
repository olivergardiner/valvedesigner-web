/** Presentation for the characteristic viewer and both manual model fitters.
 * The existing adapters retain ownership of sampling, normalisation and export.
 */
function toolParameterIssue(fields, reference = []) {
	const values = fields.map(Number);
	if (fields.some(value => String(value).trim() === '') || values.some(value => !Number.isFinite(value))) return 'Enter a number in every chart field.';
	if (values[0] < 0 || values[1] < values[0] || values[2] <= 0) return 'Use positive grid steps and a stop value at least as large as the start.';
	if ((values[1] - values[0]) / values[2] > 200) return 'Choose a grid step that produces no more than 201 curves.';
	if (values.slice(3).some(value => value <= 0)) return 'Chart voltage, current and power limits must be positive.';
	if (reference.some(value => String(value).trim() === '' || !Number.isFinite(Number(value)) || Number(value) < 0)) return 'Enter non-negative static reference values.';
	if (reference.some((value, index) => index !== (reference.length === 4 ? 1 : 2) && Number(value) === 0)) return 'Reference voltages, currents and mu must be greater than zero.';
	return null;
}

function toolChartConfig(definition, datasets) {
	const config = characteristicChartConfig(definition, datasets, 'Anode characteristics');
	config.options.plugins.title.display = false;
	config.options.animation = false;
	config.options.scales.x.title = {display: true, text: 'Anode voltage (V)', font: {size: 14}};
	config.options.scales.y.title = {display: true, text: 'Current (mA)', font: {size: 14}};
	for (const axis of Object.values(config.options.scales)) {
		axis.grid = {color: '#e9eee9'};
		axis.ticks = {color: '#6b7770', font: {size: 12}};
	}
	return config;
}

class ToolsWorkspace {
	constructor() {
		this.fitting = document.body.dataset.tool === 'fitting';
		this.sessions = new Map();
		this.mode = null;
	}

	element(id) { return document.getElementById(id); }

	start() {
		document.querySelector('.skip-link').addEventListener('click', event => { event.preventDefault(); this.element('workspace').focus(); });
		this.element('tool-mode').addEventListener('change', event => { location.hash = event.target.value; });
		window.addEventListener('hashchange', () => this.route());
		this.element('tubeSelect').addEventListener('change', () => this.loadTemplate());
		this.element('reset-tool').addEventListener('click', () => this.loadTemplate());
		this.element('tool-controls').addEventListener('change', event => {
			if (event.target.matches('input')) this.update();
		});
		this.element('sliders').addEventListener('input', () => {
			if (this.update(false)) { this.adapter.updateSliders(); this.sync(); }
		});
		this.element('download-tool').addEventListener('click', () => {
			if (!this.update()) return;
			if (!this.fitting) return this.adapter.downloadJSON();
			const url = URL.createObjectURL(new Blob([JSON.stringify(this.adapter.device.definition, null, '\t')], {type: 'application/json'}));
			const link = document.createElement('a');
			link.href = url;
			link.download = (this.adapter.device.definition.name.replace(/[^a-z0-9_-]/gi, '_') || 'valve') + '.json';
			link.click();
			URL.revokeObjectURL(url);
		});
		this.element('loadCurves').addEventListener('change', event => this.loadImage(event.target.files[0]));
		this.element('clear-image').addEventListener('click', () => {
			this.session.background = null;
			this.session.imageName = null;
			this.element('loadCurves').value = '';
			this.element('image-name').textContent = 'No image loaded';
			this.adapter.chart.update();
		});
		this.element('overlay-opacity').addEventListener('input', event => {
			this.session.opacity = Number(event.target.value) / 100;
			this.adapter.chart.draw();
		});
		this.route();
	}

	route() {
		const mode = this.fitting ? (location.hash === '#pentode' ? 'pentode' : 'triode') : 'characteristics';
		if (mode === this.mode) return;
		if (this.adapter) {
			this.session.inputs = [...document.querySelectorAll('#tool-controls input, #sliders input')].map(input => [input.id, input.value]);
			this.adapter.chart?.destroy();
			this.adapter.pentodeChart?.destroy();
		}
		this.mode = mode;
		for (const link of document.querySelectorAll('nav details:last-child a')) {
			if (this.fitting && link.hash === '#' + mode) link.setAttribute('aria-current', 'page');
			else link.removeAttribute('aria-current');
		}
		this.element('tool-mode').value = mode;
		this.element('tool-title').textContent = this.fitting ? (mode === 'triode' ? 'Triode model fitting' : 'Pentode model fitting') : 'Valve characteristics';
		this.element('tool-summary').textContent = this.fitting ? 'Fit representative curves to a datasheet using a static reference point and manual adjustment.' : 'Explore the model catalogue and export synthetic characteristic curves.';
		this.adapter = this.sessions.get(mode)?.adapter || (mode === 'triode' ? new TriodeModeller(null) : mode === 'pentode' ? new PentodeModeller(null) : new Characteristics(null, null));
		this.buildFields();
		this.adapter.setBackgroundSize = () => {}; // Overlay follows Chart.js chartArea, including resize.
		this.adapter.drawChart = () => this.drawCharts();
		this.catalogue = mode === 'triode' ? triodes : mode === 'pentode' ? pentodes : smallSignalTriodes.concat(smallSignalPentodes, powerPentodes);
		this.element('tubeSelect').replaceChildren(...this.catalogue.map((tube, index) => new Option(tube.name, index)));
		if (!this.sessions.has(mode)) {
			this.sessions.set(mode, {adapter: this.adapter, index: 0, background: null, opacity: 0.55});
			this.adapter.configureParameters();
			this.loadTemplate();
		} else {
			this.element('tubeSelect').value = this.session.index;
			for (const [id, value] of this.session.inputs) this.element(id).value = value;
			this.adapter.showPlots();
			this.sync();
		}
		this.element('overlay-opacity').value = this.session.opacity * 100;
		this.element('image-name').textContent = this.session.imageName || 'No image loaded';
		this.element('loadCurves').value = '';
		this.update(false);
	}

	get session() { return this.sessions.get(this.mode); }

	buildFields() {
		const parameters = this.adapter.parameters;
		for (const [id, fields, offset] of [['chart-fields', parameters.field, 1], ['reference-fields', parameters.field2 || [], 9]]) {
			this.element(id).replaceChildren();
			fields.forEach((field, index) => {
				const wrapper = document.createElement('div');
				wrapper.className = 'field';
				const unit = field.name.includes('Current') ? 'mA' : field.name.includes('Power') ? 'W' : field.name === 'Mu' ? '' : 'V';
				wrapper.innerHTML = '<label id="fLabel' + (offset + index) + '" for="field' + (offset + index) + '"></label><div class="input-with-unit"><input type="number" step="any" id="field' + (offset + index) + '"><span>' + unit + '</span></div>';
				wrapper.querySelector('label').textContent = field.name;
				this.element(id).append(wrapper);
			});
		}
		this.element('reference-panel').hidden = !this.fitting;
		this.element('fitting-panel').hidden = !this.fitting;
		this.element('export-panel').hidden = !this.fitting;
		this.element('name-field').hidden = !this.fitting;
		this.element('mode-field').hidden = !this.fitting;
		this.element('download-tool').textContent = this.fitting ? 'Download model JSON' : 'Export curves (.vwp)';
		const sliders = this.mode === 'triode' ? [['vct', 'Contact voltage'], ['kvb', 'Kvb'], ['kvb1', 'Kvb1'], ['kp', 'Kp'], ['x', 'Exponent']] : [['alpha', 'Alpha'], ['beta', 'Beta'], ['gamma', 'Gamma'], ['kp', 'Kp'], ['a', 'A']];
		this.element('sliders').innerHTML = this.fitting ? sliders.map(([id, label]) => '<div class="field"><label for="' + id + '">' + label + '</label><input id="' + id + '" type="range" min="0" max="200" value="50"></div>').join('') : '';
		this.element('coefficients').innerHTML = parameters.value.map((name, index) => '<div><dt id="vLabel' + (index + 1) + '">' + name + '</dt><dd id="value' + (index + 1) + '"></dd></div>').join('');
	}

	loadTemplate() {
		this.session.index = Number(this.element('tubeSelect').value);
		this.adapter.configureParameters();
		this.adapter.loadDevice(this.catalogue, this.session.index);
		this.element('deviceName').value = this.adapter.device.definition.name;
		this.element('error').hidden = true;
		this.element('download-tool').disabled = false;
		this.sync();
	}

	update(apply = true) {
		const parameters = this.adapter.parameters;
		const fields = parameters.field.map((_, index) => this.element('field' + (index + 1)).value);
		// Triodes have no screen supply in the viewer.
		if (!this.fitting && this.adapter.device.definition.model.device === 'triode') fields[4] = '1';
		const reference = (parameters.field2 || []).map((_, index) => this.element('field' + (index + 9)).value);
		const issue = toolParameterIssue(fields, reference);
		this.element('error').textContent = issue || '';
		this.element('error').hidden = !issue;
		this.element('download-tool').disabled = !!issue;
		if (issue) return false;
		if (apply) { this.adapter.updateParameters(); this.sync(); }
		return true;
	}

	sync() {
		const definition = this.adapter.device.definition;
		this.element('chart-device').textContent = definition.name + ' · ' + definition.model.type;
		this.element('chart-title').textContent = definition.model.device === 'pentode' && !this.fitting ? 'Screen tied to anode' : 'Anode characteristics';
		this.element('field5')?.closest('.field').toggleAttribute('hidden', !this.fitting && definition.model.device === 'triode');
		this.element('textA').value = JSON.stringify(definition, null, '\t');
	}

	drawCharts() {
		const adapter = this.adapter;
		const overlay = {id: 'datasheet', beforeDraw: chart => {
			const image = this.session.background;
			if (!image) return;
			const {left, top, width, height} = chart.chartArea;
			chart.ctx.save();
			chart.ctx.globalAlpha = this.session.opacity;
			chart.ctx.drawImage(image, left, top, width, height);
			chart.ctx.restore();
		}};
		const power = adapter.anodePowerCurve.map(series => ({...series, borderDash: [5, 4]}));
		const config = toolChartConfig(adapter.device.definition, power.concat(adapter.anodeCurves));
		config.plugins = [overlay];
		adapter.chart = new Chart(this.element('mainChart'), config);
		const pentode = !this.fitting && adapter.device.definition.model.device === 'pentode';
		this.element('pentode').hidden = !pentode;
		if (pentode) adapter.pentodeChart = new Chart(this.element('pentodeChart'), toolChartConfig(adapter.device.definition, adapter.pentodeCurves.concat(adapter.screenCurves)));
	}

	loadImage(file) {
		if (!file) return;
		const session = this.session;
		const reader = new FileReader();
		reader.onload = () => {
			const image = new Image();
			image.onload = () => {
				session.background = image;
				session.imageName = file.name;
				if (this.session === session) { this.element('image-name').textContent = file.name; this.adapter.chart.update(); }
			};
			image.onerror = () => { this.element('image-name').textContent = 'Unable to read this image.'; };
			image.src = reader.result;
		};
		reader.readAsDataURL(file);
	}
}

if (typeof document !== 'undefined') new ToolsWorkspace().start();
