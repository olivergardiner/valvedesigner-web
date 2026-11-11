/** Shared calculation contracts. V, ohms and mA unless explicitly stated. */
class CircuitCalculationError extends RangeError {}

function requireCalculationInputs(device, parameters, deviceTypes) {
	const labels = {
		supplyVoltage: 'Supply voltage', cathodeResistance: 'Cathode resistance',
		anodeResistance: 'Anode resistance', biasResistance: 'Bias resistance',
		screenResistance: 'Screen resistance', loadResistance: 'Load resistance',
		screenVoltage: 'Screen voltage', anodeBiasCurrent: 'Anode bias current',
		vaMax: 'Maximum anode voltage', iaMax: 'Maximum anode current',
		vg1Max: 'Maximum grid bias', vg1Step: 'Grid voltage step'
	};
	if (!device || !device.definition || !device.definition.model || !device.model || !deviceTypes.includes(device.definition.model.device)) {
		throw new CircuitCalculationError('This circuit requires a supported ' + deviceTypes.join(' or ') + ' model.');
	}
	for (const [name, value] of Object.entries(parameters)) {
		if (!Number.isFinite(value) || value <= 0) {
			throw new CircuitCalculationError((labels[name] || 'Circuit input') + ' must be finite and positive.');
		}
	}
	const definition = device.definition;
	for (const key of ['vaMax', 'iaMax', 'vg1Max', 'vg1Step']) {
		if (!Number.isFinite(definition[key]) || definition[key] <= 0) {
			throw new CircuitCalculationError(labels[key] + ' must be finite and positive.');
		}
	}
	if (definition.vg1Max / definition.vg1Step > 10000) {
		throw new CircuitCalculationError('Grid sweep exceeds 10000 intervals.');
	}
}

function requireCalculationIntersection(first, second, description) {
	const crossing = intersection(first, second);
	if (crossing.i < 0 || crossing.j < 0 || !Number.isFinite(crossing.point.x) || !Number.isFinite(crossing.point.y)) {
		throw new CircuitCalculationError('No ' + description + ' intersection within the sampled range.');
	}
	return crossing;
}

function requireFiniteCalculation(result) {
	function check(value) {
		if (typeof value === 'number' && !Number.isFinite(value)) {
			throw new CircuitCalculationError('Circuit calculation produced a non-finite result.');
		}
		if (value && typeof value === 'object') Object.values(value).forEach(check);
	}
	check(result);
	return result;
}

function sampleCathodeBiasLine(device, resistance, minimumVoltage) {
	const points = [];
	for (let j = 1; j < 101; j++) {
		const grid = device.definition.vg1Max * j / 100.0;
		const current = grid * 1000.0 / resistance;
		const voltage = device.model.anodeVoltage(current, -grid);
		if (!Number.isFinite(voltage)) throw new CircuitCalculationError('Inverse model returned a non-finite voltage.');
		if (voltage > minimumVoltage) points.push({x: voltage, y: current});
	}
	return points;
}

function sampleCalculationCharacteristics(device, screenVoltage = 0, gridMultiplier = 1) {
	const definition = device.definition;
	return sampleGridFamily(0, definition.vg1Max * gridMultiplier, definition.vg1Step, grid =>
		sampleAnodeCurve(device.model, definition.vaMax, -grid, screenVoltage, {seedOrigin: true}));
}

function calculateCurveGain(device, family, loadLine, voltage, bias, scale = 1) {
	const step = device.definition.vg1Step;
	const k = family.findIndex(curve => Math.abs(bias - curve.gridVoltage) < step);
	if (k < 0) throw new CircuitCalculationError('Bias lies outside the characteristic grid sweep.');
	const crossing = requireCalculationIntersection(family[k].points, loadLine, 'gain');
	return scale * (voltage - crossing.point.x) / (bias - k * step);
}
