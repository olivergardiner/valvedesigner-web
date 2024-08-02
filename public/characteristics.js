class Characteristics extends Circuit {
	constructor(ctx, pentodeCtx) {
		super(ctx);
		this.pentodeCtx = pentodeCtx;
		this.pentodeChart = null;
		
		this.parameters = {
			nFields: 5,
			field: [
				{ name: 'Grid Start', value: 0 },
				{ name: 'Grid Stop', value: 5 },
				{ name: 'Grid Step', value: 0.5 },
				{ name: 'Max Anode Voltage', value: 300 },
				{ name: 'Screen Voltage', value: 120 }
			],
			nValues: 0,
			value: []
		};
	}
	
	anodePlot() {
		if (this.device.model.model.device === "pentode") {
			$('#fLabel5').show();
			$('#field5').show();
			$('#pentode').show();
		} else {
			$('#fLabel5').hide();
			$('#field5').hide();
			$('#pentode').hide();
		}
		
		let vg1 = this.parameters.field[0].value;
		let vg1Stop = this.parameters.field[1].value;
		let vg1Step = this.parameters.field[2].value;
		let vaMax = this.parameters.field[3].value;
		let vg2 = this.parameters.field[4].value;
		while (vg1 < vg1Stop + 0.001) {
			let anodeCurve = [];
		    for (let i = 1; i < 101; i++) {
		        let va = vaMax * i / 100.0;
				let ia = this.device.model.anodeCurrent(va, -vg1, va) * 1000.0;
		        anodeCurve.push({x: va, y: ia, vg1: -vg1, vg2: 0, ig2: 0 });
				if (ia > this.device.definition.iaMax) {
					break;
				}
		    }
			
			let dataset = {
				data: anodeCurve,
				borderColor: 'rgba(0, 0, 0, 1)'
			};
			
			this.anodeCurves.push(dataset)
			
			if (this.device.model.model.device === "pentode") {
				let pentodeCurve = [];
				let screenCurve = [];
				for (let i = 1; i < 101; i++) {
					let va = vaMax * i / 100.0;
					let ia = this.device.model.anodeCurrent(va, -vg1, vg2) * 1000.0;
					let ig2 = this.device.model.screenCurrent(va, -vg1, vg2) * 1000.0;
					pentodeCurve.push({ x: va, y: ia, vg1: -vg1, vg2: vg2, ig2: ig2 });
					screenCurve.push({ x: va, y: ig2 });
					if (ia > this.device.definition.iaMax) {
						break;
					}
				}

				let dataset = {
					data: pentodeCurve,
					borderColor: 'rgba(0, 0, 0, 1)'
				};
	
				let screenDataset = {
					data: screenCurve,
					borderColor: 'rgba(0, 191, 191, 1)'
				};

				this.pentodeCurves.push(dataset)
				this.screenCurves.push(screenDataset)
			}
				
		    vg1 += vg1Step;
		}
	}
	
	downloadJSON() {
		let data = JSON.stringify(this.createJSON(), null, 4);
		let blob = new Blob([data], { type: 'application/json' });
		let url = URL.createObjectURL(blob);
		let a = document.createElement('a');
		a.href = url;
		a.download = 'tube.vwp';
		a.click();
		URL.revokeObjectURL(url);
	}
	
	createJSON() {
		let triodeMeasurement = {
			deviceType: "triode",
			anodeStart: 0,
			anodeStep: 0,
			anodeStop: 300,
			gridStart: 0,
			gridStep: 1,
			gridStop: 7,
			screenStart: 0,
			screenStep: 0,
			screenStop: 0,
			iaMax: this.device.definition.iaMax,
			paMax: this.device.definition.paMax,
			testType: "anodeCharacteristics",
			sweeps: this.createSweeps(this.anodeCurves)
		};
		
		let data = {
			project: {
				name: this.device.definition.name,
				deviceType: this.device.model.model.device,
				measurements: [triodeMeasurement]
			}
		};
		
		if (this.device.model.model.device === "pentode") {
			let pentodeMeasurement = {
				deviceType: "pentode",
				anodeStart: 0,
				anodeStep: 0,
				anodeStop: 300,
				gridStart: 0,
				gridStep: 1,
				gridStop: 7,
				screenStart: 0,
				screenStep: 0,
				screenStop: 0,
				iaMax: this.device.definition.iaMax,
				paMax: this.device.definition.paMax,
				testType: "anodeCharacteristics",
				sweeps: this.createSweeps(this.pentodeCurves)
			};
			
			data.project.measurements.push(pentodeMeasurement);
		}
		
		return data;
	}
	
	createSweeps(curves) {
		let sweeps = [];
		for (let i = 0; i < curves.length; i++) {
			let vg1Nominal = curves[i].data[0].vg1;
			let sweep = {
				vg1Nominal: vg1Nominal,
				samples: []
			};

			for (let j = 1; j < curves[i].data.length; j++) {
				sweep.samples.push({
					va: curves[i].data[j].x,
					ia: curves[i].data[j].y,
					vg1: curves[i].data[j].vg1,
					vg2: curves[i].data[j].vg2,
					ig2: curves[i].data[j].ig2,
					vh: 6.3,
					ih: 0.3
				});
			}
			
			sweeps.push(sweep);
		}
		
		return sweeps;
	}
}