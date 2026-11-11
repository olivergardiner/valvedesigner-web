/* Asynchronous tube catalogue loading and compatibility views. Data lives in tubes.json. */
let valveCatalogue = null;
let smallSignalTriodes = [];
let smallSignalPentodes = [];
let powerTriodes = [];
let powerPentodes = [];
let valveCatalogueRequest = null;

/** Flat compatibility views isolate existing calculations from catalogue storage. */
function valveDisplayDefinition(entry) {
	return {name: entry.name, ...structuredClone(entry.display), model: structuredClone(entry.model), static: structuredClone(entry.static)};
}

function valveFittingDefinition(entry) {
	const definition = valveDisplayDefinition(entry);
	for (const key of ['vaMax', 'iaMax', 'vg1Max', 'vg1Step']) definition[key] = entry.fitting[key];
	return definition;
}

function valveFittingCatalogue(device) {
	return valveCatalogue.devices.filter(entry => entry.model.device === device);
}

function validateValveCatalogue(data) {
	const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
	const positive = value => typeof value === 'number' && Number.isFinite(value) && value > 0;
	const nonNegative = value => typeof value === 'number' && Number.isFinite(value) && value >= 0;
	const fail = message => { throw new Error('Invalid tube catalogue: ' + message); };
	if (!object(data) || data.version !== 1 || !Array.isArray(data.devices) || !data.devices.length) fail('expected version 1 with a non-empty devices array.');
	const categories = {smallSignalTriodes: 'triode', smallSignalPentodes: 'pentode', powerTriodes: 'triode', powerPentodes: 'pentode'};
	const names = new Set();
	for (const entry of data.devices) {
		if (!object(entry) || typeof entry.name !== 'string' || !entry.name.trim() || names.has(entry.name)) fail('device names must be present and unique.');
		names.add(entry.name);
		const failEntry = message => fail(entry.name + ': ' + message);
		for (const section of ['model', 'display', 'fitting', 'static']) if (!object(entry[section])) failEntry('missing ' + section + ' section.');
		const {model, display, fitting, static: reference} = entry;
		if (!Object.hasOwn(categories, entry.category) || categories[entry.category] !== model.device) failEntry('category does not match device type.');
		const required = model.device === 'triode' && model.type === 'cohenHelie'
			? ['mu','kg1','kp','x','kvb','kvb1','vct']
			: model.device === 'pentode' && model.type === 'simple' ? ['mu','kg1','kg2','kp','alpha','beta','gamma','a'] : null;
		if (!required) failEntry('unsupported model type for the design/fitting catalogue.');
		for (const key of required) if (typeof model[key] !== 'number' || !Number.isFinite(model[key])) failEntry('model.' + key + ' must be finite.');
		if (!positive(model.mu) || !positive(model.kg1) || !positive(model.kp) || (model.device === 'pentode' && !positive(model.kg2))) failEntry('model current scales, kp and mu must be positive.');
		if (Object.hasOwn(reference, 'mu') || Object.hasOwn(fitting, 'mu')) failEntry('mu belongs only in model.');
		for (const key of ['vaMax','iaMax','vg1Max','vg1Step','paMax']) if (!positive(display[key])) failEntry('display.' + key + ' must be positive.');
		if (display.vg1Max / display.vg1Step > 200) failEntry('display grid sweep exceeds 201 curves.');
		for (const key of ['vaMax','iaMax','vg1Step']) if (!positive(fitting[key])) failEntry('fitting.' + key + ' must be positive.');
		if (!nonNegative(fitting.vg1Start) || !nonNegative(fitting.vg1Max) || fitting.vg1Max < fitting.vg1Start || (fitting.vg1Max - fitting.vg1Start) / fitting.vg1Step > 200) failEntry('invalid fitting grid sweep.');
		if (fitting.image !== undefined && typeof fitting.image !== 'string') failEntry('fitting.image must be a path string.');
		if (!positive(reference.va) || !positive(reference.ia) || !nonNegative(reference.vg1)) failEntry('invalid static reference point.');
		if (model.device === 'pentode' && (!positive(display.vg2Max) || !positive(fitting.vg2) || !positive(reference.vg2) || !positive(reference.ig2))) failEntry('invalid screen voltage/current.');
	}
	for (const category of ['smallSignalTriodes','smallSignalPentodes','powerPentodes']) if (!data.devices.some(entry => entry.category === category)) fail('missing devices for ' + category + '.');
	return data;
}

/** Validate and build every view before publishing any state. */
function installValveCatalogue(data) {
	const catalogue = structuredClone(validateValveCatalogue(data));
	const groups = Object.fromEntries(['smallSignalTriodes','smallSignalPentodes','powerTriodes','powerPentodes'].map(category =>
		[category, catalogue.devices.filter(entry => entry.category === category).map(valveDisplayDefinition)]));
	valveCatalogue = catalogue;
	smallSignalTriodes = groups.smallSignalTriodes;
	smallSignalPentodes = groups.smallSignalPentodes;
	powerTriodes = groups.powerTriodes;
	powerPentodes = groups.powerPentodes;
	return catalogue;
}

/** Share an in-flight request; failed loads may be retried without reloading the page. */
function loadValveCatalogue(fetcher = fetch) {
	if (valveCatalogue) return Promise.resolve(valveCatalogue);
	if (valveCatalogueRequest) return valveCatalogueRequest;
	const controller = new AbortController();
	let timer;
	const timeout = new Promise((resolve, reject) => {
		timer = setTimeout(() => { controller.abort(); reject(new Error('Loading tube data timed out. Check the server and retry.')); }, 15000);
	});
	valveCatalogueRequest = Promise.race([(async () => {
		const response = await fetcher('tubes.json', {signal: controller.signal});
		if (!response.ok) throw new Error('Unable to load tubes.json (HTTP ' + response.status + ').');
		let data;
		try { data = await response.json(); }
		catch (error) { throw new Error('The tube data file is not valid JSON.'); }
		return data;
	})(), timeout]).then(installValveCatalogue).catch(error => {
		valveCatalogueRequest = null;
		throw error;
	}).finally(() => clearTimeout(timer));
	return valveCatalogueRequest;
}
