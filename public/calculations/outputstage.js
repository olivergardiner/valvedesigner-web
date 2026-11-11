/** Shared transformer output-stage calculation. loadResistance is SE load or PP Raa. */
function calculateOutputStage(device, parameters, {pushPull = false, ultralinear = false} = {}) {
	const {supplyVoltage: vb, anodeBiasCurrent: ia, loadResistance: raa} = parameters;
	const positiveInputs = {supplyVoltage: vb, anodeBiasCurrent: ia, loadResistance: raa};
	if (!ultralinear) positiveInputs.screenVoltage = parameters.screenVoltage;
	requireCalculationInputs(device, positiveInputs, ultralinear ? ['pentode'] : ['triode', 'pentode']);
	if (ultralinear && (!Number.isFinite(parameters.screenTap) || parameters.screenTap < 0 || parameters.screenTap > 1)) {
		throw new CircuitCalculationError('Screen tap must be between 0 and 1.');
	}
	const screenVoltage = ultralinear
		? voltage => voltage * parameters.screenTap + vb * (1.0 - parameters.screenTap)
		: parameters.screenVoltage;
	const biasScreenVoltage = ultralinear ? vb : parameters.screenVoltage;
	const vg1Max = device.definition.vg1Max * (ultralinear ? 2 : 1);
	if (vg1Max / device.definition.vg1Step > 10000) throw new CircuitCalculationError('Grid sweep exceeds 10000 intervals.');
	const gradient = (pushPull ? -2000.0 : -1000.0) / raa;
	const iaMaxA = ia - gradient * vb;
	const vaMaxA = -iaMaxA / gradient;
	const iaMaxB = 4000.0 * vb / raa;
	const acLoadLine = [];
	for (let i = 0; i < 101; i++) {
		const voltage = i * vaMaxA / 100;
		const current = pushPull
			? smax(iaMaxB - voltage * 4000.0 / raa, iaMaxA - voltage * 2000.0 / raa, 5)
			: iaMaxA - voltage * 1000.0 / raa;
		acLoadLine.push({x: voltage, y: current});
	}
	const zeroGrid = sampleAnodeCurve(device.model, device.definition.vaMax, 0.0, screenVoltage, {startIndex: 1});
	requireFiniteCalculation({acLoadLine, zeroGrid});
	const limit = requireCalculationIntersection(zeroGrid, acLoadLine, 'output power-limit').point;
	const outputPower = (vb - limit.x) * limit.y / 2000.0;
	// Keep the legacy bias resolution: 1001 candidates only for fixed-screen single-ended.
	const intervals = !pushPull && !ultralinear ? 1000 : 100;
	let minimumError = 1000.0;
	let bias;
	for (let i = 0; i <= intervals; i++) {
		const grid = i * vg1Max / intervals;
		const error = Math.abs(ia - 1000.0 * device.model.anodeCurrent(vb, -grid, biasScreenVoltage));
		if (!Number.isFinite(error)) throw new CircuitCalculationError('Bias search produced a non-finite current.');
		if (error < minimumError) {
			minimumError = error;
			bias = grid;
		}
	}
	if (bias === undefined) throw new CircuitCalculationError('No bias candidate found within the sampled range.');
	let ik = ia;
	if (device.definition.model.device === 'pentode') ik += 1000.0 * device.model.screenCurrent(vb, -bias, biasScreenVoltage);
	const cathodeResistance = pushPull ? 1000.0 * bias / (ik * 2) : 1000.0 * bias / ik;
	return requireFiniteCalculation({
		operatingPoint: {anodeVoltage: vb, anodeCurrent: ia, biasVoltage: bias, cathodeCurrent: ik},
		cathodeResistance, outputPower,
		curves: {acLoadLine, characteristics: sampleCalculationCharacteristics(device, screenVoltage, ultralinear ? 2 : 1).map(curve => curve.points),
			dissipation: sampleDissipationCurve(device.definition)}
	});
}
