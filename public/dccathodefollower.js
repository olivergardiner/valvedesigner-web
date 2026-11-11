class DCCathodeFollower extends CalculatedCircuit {
	constructor(ctx) {
		super(ctx);
		
		this.parameters = {
			nFields: 4,
			field: [
				{ name: 'Supply voltage', value: 300 },
				{ name: 'Cathode resistor Rk', value: 1500 },
				{ name: 'Anode resistor Ra', value: 100000 },
				{ name: 'Load impedance Rl', value: 82000 }
			],
			nValues: 6,
			value: [
				'Bias point Vk (V)',
				'Anode voltage (V)',
				'Anode current (mA)',
				'Gain',
				'Follower voltage (V)',
				'Follower current(mA)'
			]
		};
		this.calculation = calculateDCCathodeFollower;
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
			'gain',
			'followerOperatingPoint.anodeVoltage',
			'followerOperatingPoint.anodeCurrent'
		];
		this.resultSeries = [
			{point: 'operatingPoint', color: 'rgba(0, 255, 0, 1)', label: 'V1 operating point'},
			{curve: 'anodeLoadLine', color: 'rgba(0, 127, 0, 1)', label: 'Anode load line'},
			{point: 'followerOperatingPoint', color: 'rgba(0, 255, 255, 1)', label: 'V2 operating point'},
			{curve: 'followerLoadLine', color: 'rgba(0, 191, 191, 1)', label: 'Follower load line'},
			{curve: 'cathodeLoadLine', color: 'rgba(0, 0, 127, 1)', label: 'Cathode load line'}
		];
	}
}
