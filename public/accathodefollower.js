class ACCathodeFollower extends CalculatedCircuit {
	constructor(ctx) {
		super(ctx);
		
		this.parameters = {
			nFields: 4,
			field: [
				{ name: 'Supply voltage', value: 300 },
				{ name: 'Anode resistor Rb', value: 620 },
				{ name: 'Cathode resistor Rk', value: 47000 },
				{ name: 'Load impedance Rl', value: 100000 }
			],
			nValues: 4,
			value: [
				'Bias point Vb (V)',
				'Cathode voltage (V)',
				'Cathode current (mA)',
				'Output impedance (ohms)'
			]
		};
		this.calculation = calculateACCathodeFollower;
		this.parameterKeys = [
			'supplyVoltage',
			'biasResistance',
			'cathodeResistance',
			'loadResistance'
		];
		this.outputPaths = [
			'operatingPoint.biasVoltage',
			'operatingPoint.cathodeVoltage',
			'operatingPoint.cathodeCurrent',
			'outputImpedance'
		];
		this.resultSeries = [
			{point: 'operatingPoint', color: 'rgba(0, 255, 0, 1)', label: 'Operating point'},
			{curve: 'anodeLoadLine', color: 'rgba(0, 127, 0, 1)', label: 'Cathode load line'},
			{curve: 'cathodeLoadLine', color: 'rgba(0, 0, 127, 1)', label: 'Bias load line'},
			{curve: 'acLoadLine', color: 'rgba(0, 191, 191, 1)', label: 'Cathode load line'}
		];
	}
}
