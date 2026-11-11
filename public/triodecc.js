class TriodeCC extends CalculatedCircuit {
	constructor(ctx) {
		super(ctx);
		
		this.parameters = {
			nFields: 4,
			field: [
				{ name: 'Supply voltage', value: 300 },
				{ name: 'Cathode resistor Rk', value: 1000 },
				{ name: 'Anode resistor Ra', value: 100000 },
				{ name: 'Load impedance Rl', value: 1000000 }
			],
			nValues: 5,
			value: [
				'Bias point Vk (V)',
				'Anode voltage (V)',
				'Anode current (mA)',
				'Gain (unbypassed)',
				'Gain (bypassed)'
			]
		};
		this.calculation = calculateTriodeCC;
		this.parameterKeys = [
			'supplyVoltage',
			'cathodeResistance',
			'anodeResistance',
			'loadResistance'
		];
		this.outputPaths = [
			'operatingPoint.cathodeVoltage',
			'operatingPoint.anodeVoltage',
			'operatingPoint.anodeCurrent',
			'gain.unbypassed',
			'gain.bypassed'
		];
		this.resultSeries = [
			{point: 'operatingPoint', color: 'rgba(0, 255, 0, 1)', label: 'Operating point'},
			{curve: 'anodeLoadLine', color: 'rgba(0, 127, 0, 1)', label: 'Anode load line'},
			{curve: 'cathodeLoadLine', color: 'rgba(0, 0, 127, 1)', label: 'Cathode load line'}
		];
	}

	showPlots() {
		$('#calculationError').text('');
		super.showPlots();
	}
}
