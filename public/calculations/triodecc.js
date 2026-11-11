/** Common-cathode triode. Voltages V, resistances ohms, returned currents mA. */
function calculateTriodeCC(device, parameters) {
	const {supplyVoltage: vb, cathodeResistance: rk, anodeResistance: ra, loadResistance: rl} = parameters;
	requireCalculationInputs(device, {supplyVoltage: vb, cathodeResistance: rk, anodeResistance: ra, loadResistance: rl}, ['triode']);
	const model = device.model;
	const intercept = vb / (ra + rk) * 1000.0;
	const anodeLoadLine = sampleLoadLine(vb, intercept);
	const cathodeLoadLine = sampleCathodeBiasLine(device, rk, 0.001);
	const point = requireCalculationIntersection([{x: 0, y: intercept}, {x: vb, y: 0}], cathodeLoadLine, 'triode operating-point').point;
	const bias = point.y * rk / 1000.0;
	const ar = 10.0 / (model.anodeCurrent(vb, -bias) - model.anodeCurrent(vb - 10.0, -bias));
	const re = ra * rl / (ra + rl);
	const mu = model.model.mu;
	const unbypassed = mu * re / (re + ar + rk * (mu + 1.0));
	const family = sampleCalculationCharacteristics(device);
	// Preserve the final displayed legacy gain, rather than the overwritten analytic estimate.
	const bypassed = calculateCurveGain(device, family, anodeLoadLine, point.x, bias, rl / (ra + rl));
	return requireFiniteCalculation({
		operatingPoint: {anodeVoltage: point.x, anodeCurrent: point.y, cathodeVoltage: bias},
		gain: {unbypassed, bypassed},
		curves: {anodeLoadLine, cathodeLoadLine, characteristics: family.map(curve => curve.points),
			dissipation: sampleDissipationCurve(device.definition)}
	});
}
