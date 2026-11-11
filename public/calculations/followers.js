/** AC coupled follower; preserves the existing node-voltage and impedance estimates. */
function calculateACCathodeFollower(device, parameters) {
	const {supplyVoltage: vb, biasResistance: rb, cathodeResistance: rk, loadResistance: rl} = parameters;
	requireCalculationInputs(device, {supplyVoltage: vb, cathodeResistance: rk, biasResistance: rb, loadResistance: rl}, ['triode']);
	const intercept = vb / (rb + rk) * 1000.0;
	const anodeLoadLine = sampleLoadLine(vb, intercept);
	const cathodeLoadLine = sampleCathodeBiasLine(device, rb, 0.0001);
	const point = requireCalculationIntersection([{x: 0, y: intercept}, {x: vb, y: 0}], cathodeLoadLine, 'follower operating-point').point;
	const bias = point.y * rb / 1000.0;
	const cathodeVoltage = point.y * (rk + rb) / 1000.0;
	const gm = 10.0 * (device.model.anodeCurrent(point.x, -(bias - 0.05)) - device.model.anodeCurrent(point.x, -(bias + 0.05)));
	const rac = rk * rl / (rk + rl);
	const vac = point.x + point.y * rac / 1000.0;
	const iac = vac / rac;
	return requireFiniteCalculation({
		operatingPoint: {anodeVoltage: point.x, anodeCurrent: point.y, cathodeVoltage, cathodeCurrent: point.y, biasVoltage: bias},
		outputImpedance: 1.0 / gm,
		curves: {anodeLoadLine, cathodeLoadLine, acLoadLine: sampleLoadLine(vac, iac * 1000.0),
			characteristics: sampleCalculationCharacteristics(device).map(curve => curve.points),
			dissipation: sampleDissipationCurve(device.definition)}
	});
}

/** DC coupled driver/follower approximation, not an independent second-valve solve. */
function calculateDCCathodeFollower(device, parameters) {
	const {supplyVoltage: vb, cathodeResistance: rk, anodeResistance: ra, loadResistance: rl} = parameters;
	requireCalculationInputs(device, {supplyVoltage: vb, cathodeResistance: rk, anodeResistance: ra, loadResistance: rl}, ['triode']);
	const intercept = vb / (ra + rk) * 1000.0;
	const anodeLoadLine = sampleLoadLine(vb, intercept);
	const cathodeLoadLine = sampleCathodeBiasLine(device, rk, 0.0001);
	const point = requireCalculationIntersection([{x: 0, y: intercept}, {x: vb, y: 0}], cathodeLoadLine, 'driver operating-point').point;
	const bias = point.y * rk / 1000.0;
	const family = sampleCalculationCharacteristics(device);
	const gain = calculateCurveGain(device, family, anodeLoadLine, point.x, bias);
	return requireFiniteCalculation({
		operatingPoint: {anodeVoltage: point.x, anodeCurrent: point.y, cathodeVoltage: bias},
		followerOperatingPoint: {anodeVoltage: vb - point.x, anodeCurrent: 1000.0 * point.x / rl},
		gain,
		curves: {anodeLoadLine, cathodeLoadLine, followerLoadLine: sampleLoadLine(vb, 1000.0 * vb / rl),
			characteristics: family.map(curve => curve.points), dissipation: sampleDissipationCurve(device.definition)}
	});
}
