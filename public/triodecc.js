class TriodeCC extends CalculatedCircuit {
	constructor(ctx) {
		super(ctx);
		const definition = designerCircuitDefinitions.find(circuit => circuit.id === 'triodecc');
		this.parameters = {
			nFields: definition.parameters.length,
			field: definition.parameters.map(parameter => ({name: parameter.legacyLabel, value: parameter.defaultValue})),
			nValues: definition.outputs.length,
			value: definition.outputs.map(output => output.legacyLabel)
		};
		this.calculation = definition.calculate;
		this.parameterKeys = definition.parameters.map(parameter => parameter.key);
		this.outputPaths = definition.outputs.map(output => output.path);
		this.resultSeries = definition.series;
	}

	showPlots() {
		$('#calculationError').text('');
		super.showPlots();
	}
}
