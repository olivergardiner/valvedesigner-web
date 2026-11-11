/** In-memory circuit edits and calculation binding, independent of the DOM. */
class DesignerSession {
	constructor(definitions) {
		this.definitions = definitions;
		this.states = new Map();
	}

	definition(id) {
		const definition = this.definitions.find(circuit => circuit.id === id);
		if (!definition) throw new RangeError('Unknown circuit.');
		return definition;
	}

	state(id) {
		if (!this.states.has(id)) {
			this.states.set(id, {deviceIndex: 0, inputs: {}});
			this.resetParameters(id);
		}
		return this.states.get(id);
	}

	resetParameters(id) {
		const definition = this.definition(id);
		if (!this.states.has(id)) this.states.set(id, {deviceIndex: 0, inputs: {}});
		this.states.get(id).inputs = Object.fromEntries(definition.parameters.map(parameter =>
			[parameter.key, String(parameter.defaultValue / parameter.scale)]));
	}

	calculate(id) {
		const definition = this.definition(id);
		const state = this.state(id);
		const parameters = {};
		for (const parameter of definition.parameters) {
			const raw = state.inputs[parameter.key];
			const value = raw.trim() === '' ? NaN : Number(raw);
			const issue = designerParameterIssue(parameter, raw);
			if (issue) throw new RangeError(issue);
			parameters[parameter.key] = value * parameter.scale;
		}
		const devices = definition.devices();
		if (!Number.isInteger(state.deviceIndex) || !devices[state.deviceIndex]) throw new RangeError('Choose a valve model.');
		const device = new Device(structuredClone(devices[state.deviceIndex]));
		return {device, result: definition.calculate(device, parameters)};
	}
}

function resolveDesignerRoute(hash, definitions = designerCircuitDefinitions) {
	const id = hash.replace(/^#/, '') || 'triodecc';
	if (id === 'circuits') return {kind: 'directory'};
	if (definitions.some(circuit => circuit.id === id)) return {kind: 'circuit', id};
	return {kind: 'unknown'};
}

function designerResultValue(result, path) {
	return path.split('.').reduce((value, key) => value[key], result);
}

function designerParameterIssue(parameter, raw) {
	const value = raw.trim() === '' ? NaN : Number(raw);
	const minimum = parameter.min === undefined ? 0 : parameter.min;
	const validMinimum = parameter.includeMin ? value >= minimum : value > minimum;
	if (!Number.isFinite(value) || !Number.isFinite(value * parameter.scale) || !validMinimum || (parameter.max !== undefined && value > parameter.max)) {
		return parameter.max !== undefined
			? 'Enter ' + parameter.label.toLowerCase() + ' between ' + minimum + ' and ' + parameter.max + ' ' + parameter.unit + '.'
			: 'Enter a positive value for ' + parameter.label.toLowerCase() + '.';
	}
	return null;
}

function designerSeriesColor(series) {
	return ({
		'rgba(0, 255, 0, 1)': '#246c50', 'rgba(0, 127, 0, 1)': '#246c50',
		'rgba(0, 0, 127, 1)': '#5879b3', 'rgba(0, 191, 191, 1)': '#29969e',
		'rgba(0, 255, 255, 1)': '#29969e'
	})[series.color] || series.color;
}

/** Workspace presentation, retaining each circuit's overlay order and distinct markers. */
function designerChartConfig(device, result, definition) {
	const datasets = result.curves.characteristics.map((data, index) => ({
		...lineDataset(data, '#939f97', 'Grid −' + Number((index * device.definition.vg1Step).toFixed(3)) + ' V'),
		borderWidth: 1.35, pointRadius: 0
	}));
	const overlays = definition.series.map(series => {
		const label = typeof series.label === 'function' ? series.label(result) : (series.legendLabel || series.label);
		const color = designerSeriesColor(series);
		if (series.point) {
			const point = designerResultValue(result, series.point);
			return {...pointDataset(point.anodeVoltage, point.anodeCurrent, color, label), borderWidth: 2, pointRadius: 5};
		}
		return {...lineDataset(result.curves[series.curve], color, label), borderWidth: 2, pointRadius: 0};
	});
	const limit = result.curves.dissipation.length ? [{
		...dissipationDataset(result.curves.dissipation, device.definition.paMax),
		borderColor: '#b9694e', borderDash: [5, 4], borderWidth: 1.5, pointRadius: 0
	}] : [];
	const config = characteristicChartConfig(device.definition, overlays.concat(limit, datasets), 'Anode characteristics');
	config.options.plugins.title.display = false;
	config.options.interaction = {mode: 'nearest', intersect: false};
	config.options.scales.x.title = {display: true, text: 'Anode voltage (V)', color: '#6b7770', font: {size: 14}};
	config.options.scales.y.title = {display: true, text: 'Anode current (mA)', color: '#6b7770', font: {size: 14}};
	for (const axis of Object.values(config.options.scales)) {
		axis.grid = {color: '#e9eee9'};
		axis.ticks = {color: '#778379', font: {size: 12}};
	}
	return config;
}

class DesignerWorkspace {
	constructor(document, window) {
		this.document = document;
		this.window = window;
		this.session = new DesignerSession(designerCircuitDefinitions);
		this.chart = null;
		this.activeId = null;
		this.inputs = new Map();
		this.outputs = new Map();
	}

	element(id) { return this.document.getElementById(id); }

	create(tag, className, text) {
		const element = this.document.createElement(tag);
		if (className) element.className = className;
		if (text !== undefined) element.textContent = text;
		return element;
	}

	start() {
		this.buildCircuitList();
		this.buildDirectory();
		this.setupNavigationMenus();
		this.element('skip-link').addEventListener('click', event => {
			event.preventDefault();
			this.element('workspace').focus();
		});
		this.element('circuit-select').addEventListener('change', event => {
			this.window.location.hash = event.target.value;
		});
		this.element('valve-select').addEventListener('change', event => {
			this.session.state(this.activeId).deviceIndex = Number(event.target.value);
			this.refresh();
		});
		this.element('reset-parameters').addEventListener('click', () => {
			this.session.resetParameters(this.activeId);
			this.restoreInputs();
			this.refresh();
		});
		this.element('parameter-form').addEventListener('submit', event => { event.preventDefault(); this.refresh(); });
		this.window.addEventListener('hashchange', () => this.renderRoute());
		if (!this.window.location.hash) this.window.history.replaceState(null, '', '#triodecc');
		this.renderRoute();
	}

	buildCircuitList() {
		const selector = this.element('circuit-select');
		const menu = this.element('circuit-menu-links');
		for (const link of designerCalculatorLinks) {
			const option = this.create('option', '', link.title);
			option.value = link.id;
			selector.append(option);
			const item = this.create('a', '', link.title);
			item.href = link.href;
			menu.append(item);
		}
		const directory = this.create('a', 'menu-directory-link', 'All circuits');
		directory.href = '#circuits';
		menu.append(directory);
	}

	setupNavigationMenus() {
		const menus = [...this.document.querySelectorAll('.app-header nav details')];
		for (const menu of menus) {
			menu.addEventListener('toggle', () => {
				if (menu.open) for (const other of menus) if (other !== menu) other.open = false;
			});
			menu.addEventListener('click', event => {
				if (event.target.closest('a')) {
					menu.open = false;
					menu.querySelector('summary').focus();
				}
			});
		}
		this.document.addEventListener('click', event => {
			for (const menu of menus) if (!menu.contains(event.target)) menu.open = false;
		});
		this.document.addEventListener('keydown', event => {
			if (event.key !== 'Escape') return;
			for (const menu of menus) if (menu.open) {
				menu.open = false;
				menu.querySelector('summary').focus();
				event.preventDefault();
			}
		});
	}

	buildDirectory() {
		const directory = this.element('circuit-directory');
		for (const link of designerCalculatorLinks) {
			const card = this.create('a', 'panel directory-card');
			card.href = link.href;
			card.append(this.create('span', 'eyebrow', link.category), this.create('h2', '', link.title),
				this.create('p', '', link.description), this.create('span', 'card-link', 'Open calculator →'));
			directory.append(card);
		}
	}

	renderRoute() {
		const route = resolveDesignerRoute(this.window.location.hash);
		for (const link of this.element('circuit-menu-links').querySelectorAll('a')) {
			const current = link.hash === (route.kind === 'directory' ? '#circuits' : '#' + route.id);
			if (current) link.setAttribute('aria-current', 'page');
			else link.removeAttribute('aria-current');
		}
		this.element('circuit-view').hidden = route.kind !== 'circuit';
		this.element('directory-view').hidden = route.kind !== 'directory';
		this.element('unknown-view').hidden = route.kind !== 'unknown';
		if (route.kind !== 'circuit') {
			this.destroyChart();
			this.document.title = route.kind === 'directory' ? 'All circuits · Valve Designer' : 'Circuit not found · Valve Designer';
			return;
		}
		this.activeId = route.id;
		const definition = this.session.definition(route.id);
		this.document.title = definition.title + ' · Valve Designer';
		this.element('circuit-select').value = route.id;
		this.element('circuit-title').textContent = definition.title;
		this.element('circuit-category').textContent = definition.category;
		this.element('circuit-summary').textContent = definition.summary;
		this.element('results-title').textContent = definition.resultsHeading || 'Operating point & gain';
		this.element('result-note').textContent = definition.resultNote || '';
		this.element('result-note').hidden = !definition.resultNote;
		this.renderLegend(definition);
		this.element('circuit-view').style.setProperty('--result-count', definition.outputs.length);
		this.element('circuit-view').style.setProperty('--chart-min-height', (470 + Math.max(0, definition.outputs.length - 5) * 68) + 'px');
		const image = this.element('circuit-schematic');
		image.src = definition.schematic;
		image.alt = definition.schematicAlt;
		const help = this.element('circuit-help');
		help.replaceChildren(...definition.help.map(paragraph => this.create('p', '', paragraph)));
		const selector = this.element('valve-select');
		selector.replaceChildren(...definition.devices().map((device, index) => {
			const option = this.create('option', '', device.name);
			option.value = index;
			return option;
		}));
		selector.value = this.session.state(route.id).deviceIndex;
		this.buildInputs(definition);
		this.buildOutputs(definition);
		this.restoreInputs();
		this.refresh();
	}

	renderLegend(definition) {
		const legend = this.element('chart-legend');
		legend.replaceChildren();
		const entries = [
			...definition.series.filter(series => series.curve).map(series => ({label: series.legendLabel || series.label, color: designerSeriesColor(series)})),
			{label: 'Dissipation limit', color: '#b9694e', dashed: true},
			...definition.series.filter(series => series.point).map(series => ({label: series.legendLabel || (typeof series.label === 'string' ? series.label : 'Operating point'), color: designerSeriesColor(series), point: true}))
		];
		for (const entry of entries) {
			const item = this.create('li');
			const swatch = this.create('i', 'swatch' + (entry.point ? ' point-swatch' : ''));
			swatch.setAttribute('aria-hidden', 'true');
			if (entry.point) swatch.style.backgroundColor = entry.color;
			else swatch.style.borderTopColor = entry.color;
			if (entry.dashed) swatch.style.borderTopStyle = 'dashed';
			item.append(swatch, this.document.createTextNode(entry.label));
			legend.append(item);
		}
	}

	buildInputs(definition) {
		this.inputs.clear();
		const container = this.element('parameter-fields');
		container.replaceChildren();
		for (const parameter of definition.parameters) {
			const row = this.create('div', 'field');
			const label = this.create('label', '', parameter.label);
			label.htmlFor = 'parameter-' + parameter.key;
			label.append(this.create('span', 'symbol', parameter.symbol));
			const wrapper = this.create('div', 'input-with-unit');
			const input = this.create('input');
			input.id = label.htmlFor;
			input.name = parameter.key;
			input.type = 'number';
			input.step = 'any';
			input.min = String(parameter.min === undefined ? 0 : parameter.min);
			if (parameter.max !== undefined) input.max = String(parameter.max);
			input.required = true;
			input.inputMode = 'decimal';
			input.setAttribute('aria-describedby', input.id + '-unit');
			const unit = this.create('span', '', parameter.unit);
			unit.id = input.id + '-unit';
			input.addEventListener('input', () => {
				this.session.state(this.activeId).inputs[parameter.key] = input.value;
				this.refresh();
			});
			wrapper.append(input, unit);
			row.append(label, wrapper);
			container.append(row);
			this.inputs.set(parameter.key, input);
		}
	}

	restoreInputs() {
		const state = this.session.state(this.activeId);
		for (const [key, input] of this.inputs) input.value = state.inputs[key];
	}

	buildOutputs(definition) {
		this.outputs.clear();
		const container = this.element('result-values');
		container.replaceChildren();
		for (const output of definition.outputs) {
			const item = this.create('div', 'result');
			const value = this.create('span', 'result-number', '—');
			const description = this.create('dd');
			description.append(value, this.create('span', 'result-unit', output.unit));
			item.append(this.create('dt', '', output.label), description);
			container.append(item);
			this.outputs.set(output.path, value);
		}
	}

	destroyChart() {
		if (this.chart) this.chart.destroy();
		this.chart = null;
	}

	refresh() {
		const definition = this.session.definition(this.activeId);
		const state = this.session.state(this.activeId);
		const selected = definition.devices()[state.deviceIndex];
		this.element('chart-device').textContent = selected ? selected.name : '';
		const family = selected ? ({cohenHelie: 'Cohen–Helie', ayumi: 'Ayumi', gardiner: 'Gardiner', simple: 'Simple ' + selected.model.device}[selected.model.type] || selected.model.type) : '';
		this.element('model-description').textContent = selected ? family + ' · ' + 'Datasheet-derived' : '';
		for (const [key, input] of this.inputs) {
			const value = Number(state.inputs[key]);
			input.setAttribute('aria-invalid', String(state.inputs[key].trim() === '' || !Number.isFinite(value) || value <= 0));
		}
		let calculation;
		try { calculation = this.session.calculate(this.activeId); }
		catch (error) {
			if (!(error instanceof RangeError)) throw error;
			this.showError(error.message);
			return;
		}
		this.element('calculation-error').hidden = true;
		this.element('calculation-error').textContent = '';
		const status = this.element('calculation-status');
		status.textContent = 'Calculated';
		status.classList.remove('has-error');
		for (const output of definition.outputs) {
			this.outputs.get(output.path).textContent = designerResultValue(calculation.result, output.path).toFixed(3);
		}
		const chartEmpty = this.element('chart-empty');
		const canvas = this.element('characteristic-chart');
		if (typeof this.window.Chart !== 'function') {
			canvas.hidden = true;
			chartEmpty.textContent = 'The chart library could not load. Check your connection and reload to show the graph.';
			chartEmpty.hidden = false;
			return;
		}
		canvas.hidden = false;
		chartEmpty.hidden = true;
		const config = designerChartConfig(calculation.device, calculation.result, definition);
		if (this.chart) {
			this.chart.data = config.data;
			this.chart.options = config.options;
			this.chart.update('none');
		} else this.chart = new this.window.Chart(canvas, config);
	}

	showError(message) {
		this.destroyChart();
		for (const output of this.outputs.values()) output.textContent = '—';
		const error = this.element('calculation-error');
		error.textContent = message;
		error.hidden = false;
		const status = this.element('calculation-status');
		status.textContent = 'Check values';
		status.classList.add('has-error');
		this.element('characteristic-chart').hidden = true;
		this.element('chart-empty').textContent = 'Adjust the circuit values to calculate a new operating point.';
		this.element('chart-empty').hidden = false;
	}
}

if (typeof document !== 'undefined') {
	var circuit = new DesignerWorkspace(document, window);
	circuit.start();
}
