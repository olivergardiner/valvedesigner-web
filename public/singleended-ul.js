class SingleEndedUL extends TransformerOutputCircuit {
	constructor(ctx) {
		super(ctx, {pushPull: false, ultralinear: true});
	}
}
