class PentodeCC extends CalculatedCircuit {
	constructor(ctx) {
		super(ctx);
		
		this.parameters = {
			nFields: 5,
			field: [
				{ name: 'Supply voltage', value: 280 },
				{ name: 'Cathode resistor Rk', value: 680 },
				{ name: 'Anode resistor Ra', value: 82000 },
				{ name: 'Screen resistor Rs', value: 300000 },
				{ name: 'Load impedance Rl', value: 1000000 }
			],
			nValues: 8,
			value: [
				'Bias point Vk (V)',
				'Anode voltage (V)',
				'Anode current (mA)',
				'Screen voltage (V)',
				'Screen current (mA)',
				'gm (mA/V)',
				'Gain (unbypassed)',
				'Gain (bypassed)'
			]
		};
		this.calculation = calculatePentodeCC;
		this.parameterKeys = [
			'supplyVoltage',
			'cathodeResistance',
			'anodeResistance',
			'screenResistance',
			'loadResistance'
		];
		this.outputPaths = [
			'operatingPoint.cathodeVoltage',
			'operatingPoint.anodeVoltage',
			'operatingPoint.anodeCurrent',
			'operatingPoint.screenVoltage',
			'operatingPoint.screenCurrent',
			'transconductance',
			'gain.unbypassed',
			'gain.bypassed'
		];
		this.resultSeries = [
			{point: 'operatingPoint', color: 'rgba(0, 255, 0, 1)', label: 'Operating point'},
			{curve: 'anodeLoadLine', color: 'rgba(0, 127, 0, 1)', label: 'Anode load line'},
			{curve: 'cathodeLoadLine', color: 'rgba(0, 0, 127, 1)', label: 'Cathode load line'}
		];
	}
}
