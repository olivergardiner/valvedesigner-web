/** Plain curve data shared by calculations and presentation. Currents are mA. */
function sampleVoltageCurve(maxVoltage, sample, {seedOrigin = false, startIndex = 0} = {}) {
	const points = seedOrigin ? [{x: 0, y: 0}] : [];
	for (let i = seedOrigin ? 1 : startIndex; i < 101; i++) {
		const voltage = maxVoltage * i / 100.0;
		points.push(sample(voltage, i));
	}
	return points;
}

function sampleGridFamily(start, stop, step, sample) {
	if (!Number.isFinite(start) || !Number.isFinite(stop) || !Number.isFinite(step) || step <= 0) {
		throw new RangeError('Grid sweep requires finite limits and a positive step.');
	}
	const curves = [];
	let grid = start;
	while (grid < stop + 0.001) {
		curves.push({gridVoltage: grid, points: sample(grid)});
		const next = grid + step;
		if (next === grid) throw new RangeError('Grid sweep step is too small to advance.');
		grid = next;
	}
	return curves;
}

function sampleAnodeCurve(model, maxVoltage, gridVoltage, screenVoltage = 0, options = {}) {
	return sampleVoltageCurve(maxVoltage, voltage => ({
		x: voltage,
		y: model.anodeCurrent(voltage, gridVoltage, typeof screenVoltage === 'function' ? screenVoltage(voltage) : screenVoltage) * 1000.0
	}), options);
}

function sampleLoadLine(supplyVoltage, maxCurrent) {
	return sampleVoltageCurve(supplyVoltage, (voltage, i) => ({
		x: voltage, y: maxCurrent * (1.0 - i / 100)
	}));
}

function sampleDissipationCurve({paMax, iaMax, vaMax}) {
	const points = [];
	if (paMax > 0.0) {
		const startVoltage = 1000 * paMax / iaMax;
		for (let i = 0; i < 100; i++) {
			const voltage = startVoltage + (vaMax - startVoltage) * i / 100.0;
			points.push({x: voltage, y: 1000 * paMax / voltage});
		}
	}
	return points;
}
