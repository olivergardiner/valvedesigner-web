/** Common-cathode pentode, preserving the original two-pass approximation. */
function calculatePentodeCC(device, parameters) {
	const {supplyVoltage: vb, cathodeResistance: rk, anodeResistance: ra,
		screenResistance: rs, loadResistance: rl} = parameters;
	requireCalculationInputs(device, {supplyVoltage: vb, cathodeResistance: rk, anodeResistance: ra, screenResistance: rs, loadResistance: rl}, ['pentode']);
	const definition = device.definition;
	const model = device.model;
	function pass(ratio) {
		const vaTest = definition.vaMax * ratio;
		const screenIntercept = vb / (rs + rk) * 1000.0;
		const screenBiasLine = [];
		for (let j = 1; j < 101; j++) {
			const vg1 = definition.vg1Max * j / 100.0;
			const ik = vg1 * 1000.0 / rk;
			const vg2 = model.screenVoltage(ik, vaTest, -vg1);
			const ig2 = 1000.0 * model.screenCurrent(vaTest, -vg1, vg2);
			const ia = 1000.0 * model.anodeCurrent(vaTest, -vg1, vg2);
			screenBiasLine.push({x: vg2, y: ig2, vg1: vg1, ia: ia});
		}
		requireFiniteCalculation(screenBiasLine);
		const screenPoint = requireCalculationIntersection(
			[{x: 0, y: screenIntercept}, {x: vb, y: 0}], screenBiasLine, 'screen operating-point');
		const vg2 = screenPoint.point.x;
		const ig2 = screenPoint.point.y;
		// Preserve the sampled segment's bias, rather than introducing a new interpolation policy.
		const vg1Test = screenBiasLine[screenPoint.j].vg1;
		const cathodeLoadLine = sampleAnodeCurve(model, definition.vaMax, -vg1Test, vg2, {startIndex: 1});
		const intercept = vb / (ra + rk) * 1000.0;
		const anodeLoadLine = sampleLoadLine(vb, intercept);
		const point = requireCalculationIntersection([{x: 0, y: intercept}, {x: vb, y: 0}], cathodeLoadLine, 'anode operating-point').point;
		const bias = (point.y + ig2) * rk / 1000;
		const gm = 10000.0 * (model.anodeCurrent(point.x, -(bias - 0.05), vg2) - model.anodeCurrent(point.x, -(bias + 0.05), vg2));
		const unbypassed = ra * rl / ((ra + rl) * 1000.0 * (1.0 / gm + rk / 1000.0));
		const bypassed = gm * ra * rl / ((ra + rl) * 1000.0);
		return requireFiniteCalculation({
			operatingPoint: {anodeVoltage: point.x, anodeCurrent: point.y, cathodeVoltage: bias,
				screenVoltage: vg2, screenCurrent: ig2, cathodeCurrent: point.y + ig2},
			transconductance: gm, gain: {unbypassed, bypassed}, curves: {anodeLoadLine, cathodeLoadLine}
		});
	}
	const first = pass(0.5);
	const result = pass(first.operatingPoint.anodeVoltage / vb);
	result.curves.characteristics = sampleCalculationCharacteristics(device, result.operatingPoint.screenVoltage).map(curve => curve.points);
	result.curves.dissipation = sampleDissipationCurve(definition);
	return requireFiniteCalculation(result);
}
