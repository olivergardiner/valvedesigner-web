/** Adapts plain circuit results to the existing numbered fields and charts. */
class CalculatedCircuit extends Circuit {
	showPlots() {
		if (this.hasCalculationError) {
			$('#calculationError').text('');
			$('#calculationError').hide();
		}
		this.hasCalculationError = false;
		this.result = null;
		try {
			super.showPlots();
		} catch (error) {
			if (!(error instanceof RangeError)) throw error;
			this.result = null;
			this.chart = null;
			this.pentodeChart = null;
			this.operatingPointCurves = [];
			this.anodeCurves = [];
			this.anodePowerCurve = [];
			for (let i = 1; i <= this.parameters.nValues; i++) $('#value' + i).text('\u2014');
			$('#calculationError').text(error.message);
			$('#calculationError').show();
			this.hasCalculationError = true;
		}
	}

	resultValue(path) {
		return path.split('.').reduce((value, key) => value[key], this.result);
	}

	loadLines() {
		const parameters = Object.fromEntries(this.parameterKeys.map((key, index) => [key, this.parameters.field[index].value]));
		this.result = this.calculation(this.device, parameters);
		this.outputPaths.forEach((path, index) => $('#value' + (index + 1)).text(this.resultValue(path).toFixed(3)));
		this.operatingPointCurves = this.resultSeries.map(series => {
			const label = typeof series.label === 'function' ? series.label(this.result) : series.label;
			if (series.point) {
				const point = this.resultValue(series.point);
				return pointDataset(point.anodeVoltage, point.anodeCurrent, series.color, label);
			}
			return lineDataset(this.result.curves[series.curve], series.color, label);
		});
	}

	anodePlot() {
		this.anodeCurves = this.result.curves.characteristics.map(data => lineDataset(data));
	}

	anodePowerPlot() {
		this.addDissipationCurve(this.result.curves.dissipation);
	}
}

/** Shared field/presentation metadata for the four transformer output pages. */
class TransformerOutputCircuit extends CalculatedCircuit {
	constructor(ctx, {pushPull = false, ultralinear = false} = {}) {
		super(ctx);
		this.parameters = {
			nFields: 4,
			field: [
				{name: 'Supply voltage', value: 300},
				{name: ultralinear ? 'Screen tap' : 'Screen voltage', value: ultralinear ? (pushPull ? 0.3 : 0.5) : 250},
				{name: 'Bias current (anode)', value: 30},
				{name: pushPull ? 'Anode to anode load' : 'Anode load', value: 8000}
			],
			nValues: 4,
			value: ['Bias point (V)', 'Cathode current (mA)', 'Cathode resistor (ohms)', 'Max output power (W)']
		};
		this.calculation = (device, parameters) => calculateOutputStage(device, parameters, {pushPull, ultralinear});
		this.parameterKeys = ['supplyVoltage', ultralinear ? 'screenTap' : 'screenVoltage', 'anodeBiasCurrent', 'loadResistance'];
		this.outputPaths = ['operatingPoint.biasVoltage', 'operatingPoint.cathodeCurrent', 'cathodeResistance', 'outputPower'];
		this.resultSeries = [
			{point: 'operatingPoint', color: 'rgba(0, 255, 0, 1)', label: result => 'Operating point (vg = ' + result.operatingPoint.biasVoltage.toFixed(3) + 'V)'},
			{curve: 'acLoadLine', color: 'rgba(0, 127, 0, 1)', label: 'AC load line'}
		];
	}

	anodePlot() {
		// Retain the existing page visibility policy while extracting calculations.
		if (this.device.definition.model.device === 'pentode') {
			$('#fLabel1').show();
			$('#field1').show();
		} else {
			$('#fLabel1').hide();
			$('#field1').hide();
		}
		super.anodePlot();
	}
}
