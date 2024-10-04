class PentodeModeller extends Circuit {
	constructor(ctx) {
		super(ctx);
		
		this.parameters = {
			nFields: 8,
			field: [
				{ name: 'Grid Start', value: 0 },
				{ name: 'Grid Stop', value: 30 },
				{ name: 'Grid Step', value: 5 },
				{ name: 'Max Anode Voltage', value: 500 },
				{ name: 'Max Anode Current', value: 350 },
				{ name: 'Max Anode Power', value: 25 },
				{ name: 'Screen Voltage', value: 250 },
				{ name: 'Max Screen Voltage', value: 425 }
			],
			nFields2: 6,
			field2: [
				{ name: 'Anode Voltage', value: 250 },
				{ name: 'Screen Voltage', value: 250 },
				{ name: 'Grid Voltage', value: 12.2 },
				{ name: 'Anode Current', value: 100 },
				{ name: 'Screen Current', value: 14.9 },
				{ name: 'Mu', value: 11 }
			],
			nValues: 8,
			value: [
				'Mu',
				'Kg1',
				'Kg2',
				'Kp',
				'Alpha',
				'Beta',
				'Gamma',
				'A'
			]
		};
		
		this.alphaMax = 2;
		this.kpMax = 200;
		this.aMax = 0.05;
		
		this.alphaPotFactor = 0.3;
		this.betaPotFactor = 0.5;
		this.gammaPotFactor = 0.4;
		this.kpPotFactor = 0.5;
		this.aPotFactor = 0.2;
	}
	
	configureParameters() {
		super.configureParameters();
		
		for (let i = 0; i < 8; i++) {
			if (i < this.parameters.nFields2) {
				$('#fLabel' + (i + 9)).text(this.parameters.field2[i].name);
				$('#field' + (i + 9)).val(this.parameters.field2[i].value);
				$('#fLabel' + (i + 9)).show();
				$('#field' + (i + 9)).show();
			} else {
				$('#fLabel' + (i + 9)).hide();
				$('#field' + (i + 9)).hide();
			}
		}
	}

	updateParameters() {		
		for (let i = 0; i < this.parameters.nFields; i++) {
			this.parameters.field[i].value = parseFloat($('#field' + (i + 1)).val());
			$('#field' + (i + 1)).text(this.parameters.field[i].value);
		}
		
		for (let i = 0; i < this.parameters.nFields2; i++) {
			this.parameters.field2[i].value = parseFloat($('#field' + (i + 9)).val());
			$('#field' + (i + 9)).text(this.parameters.field2[i].value);
		}

		this.device.definition.vg1Max = this.parameters.field[1].value;
		this.device.definition.vg1Step = this.parameters.field[2].value;
		this.device.definition.vaMax = this.parameters.field[3].value;
		this.device.definition.iaMax = this.parameters.field[4].value;
		this.device.definition.paMax = this.parameters.field[5].value;
		this.device.definition.vg2Max = this.parameters.field[7].value;
		
		this.device.definition.static.va = this.parameters.field2[0].value;
		this.device.definition.static.vg2 = this.parameters.field2[1].value;
		this.device.definition.static.vg1 = this.parameters.field2[2].value;
		this.device.definition.static.ia = this.parameters.field2[3].value;
		this.device.definition.static.ig2 = this.parameters.field2[4].value;

		this.device.definition.name = $('#deviceName').val();

		this.aMax = 0.01 / Math.pow(this.device.definition.model.mu, 0.3);
		this.kpMax = this.device.definition.model.mu * 10.0;

		$('#kp').val(inversePotFunction((this.device.definition.model.kp - 1) / this.kpMax, this.kpPotFactor) * 200);
		$('#a').val(inversePotFunction(this.device.definition.model.a / this.aMax, this.aPotFactor) * 200);
		
		this.updateModel();

		this.showPlots();
	}
	
	updateSliders() {
		let alphaValue = potFunction($('#alpha').val() / 200, this.alphaPotFactor);
		let betaValue = potFunction($('#beta').val() / 200, this.betaPotFactor);
		let gammaValue = potFunction($('#gamma').val() / 200, this.gammaPotFactor);
		let kpValue = potFunction($('#kp').val() / 200, this.kpPotFactor);
		let aValue = potFunction($('#a').val() / 200, this.aPotFactor);
		
		this.device.definition.model.alpha = alphaValue * this.alphaMax;
		this.device.definition.model.beta = 3.125 / ((betaValue + 0.001) * 300);
		this.device.definition.model.gamma = gammaValue * 2 + 0.2;
		this.device.definition.model.kp = kpValue * this.kpMax + 1;
		this.device.definition.model.a = aValue * this.aMax;
				
		this.updateModel();
		
		this.showPlots();
	}

	onDeviceLoad() {
		this.aMax = 0.01 / Math.pow(this.device.definition.model.mu, 0.3);
		this.kpMax = this.device.definition.model.mu * 10.0;
		
		$('#alpha').val(inversePotFunction(this.device.definition.model.alpha / this.alphaMax, this.alphaPotFactor) * 200);
		$('#beta').val(inversePotFunction(3.125 / this.device.definition.model.beta / 300, this.betaPotFactor) * 200);
        $('#gamma').val(inversePotFunction((this.device.definition.model.gamma - 0.2) / 2, this.gammaPotFactor) * 200);
		$('#kp').val(inversePotFunction((this.device.definition.model.kp - 1) / this.kpMax, this.kpPotFactor) * 200);
		$('#a').val(inversePotFunction(this.device.definition.model.a / this.aMax, this.aPotFactor) * 200);
								
		this.parameters.field[0].value = 0.0;
		this.parameters.field[1].value = this.device.definition.vg1Max;
		this.parameters.field[2].value = this.device.definition.vg1Step;
		this.parameters.field[3].value = this.device.definition.vaMax;
		this.parameters.field[4].value = this.device.definition.iaMax;
		this.parameters.field[5].value = this.device.definition.paMax;
		this.parameters.field[6].value = this.device.definition.static.vg2;
		this.parameters.field[7].value = this.device.definition.vg2Max;
		
		$('#field2').val(this.device.definition.vg1Max);
		$('#field3').val(this.device.definition.vg1Step);
		$('#field4').val(this.device.definition.vaMax);
		$('#field5').val(this.device.definition.iaMax);
		$('#field6').val(this.device.definition.paMax);
		$('#field7').val(this.device.definition.static.vg2);
		$('#field8').val(this.device.definition.vg2Max);
		
		this.parameters.field2[0].value = this.device.definition.static.va;
		this.parameters.field2[1].value = this.device.definition.static.vg2;
		this.parameters.field2[2].value = this.device.definition.static.vg1;
		this.parameters.field2[3].value = this.device.definition.static.ia;
		this.parameters.field2[4].value = this.device.definition.static.ig2;
		this.parameters.field2[5].value = this.device.definition.model.mu;
		
		$('#field9').val(this.device.definition.static.va);
		$('#field10').val(this.device.definition.static.vg2);
		$('#field11').val(this.device.definition.static.vg1);
		$('#field12').val(this.device.definition.static.ia);
		$('#field13').val(this.device.definition.static.ig2);
		$('#field14').val(this.device.definition.model.mu);
	}
	
	updateModel() {
		let alpha = this.device.definition.model.alpha;
		let beta = this.device.definition.model.beta;
		let gamma = this.device.definition.model.gamma;
		let kp = this.device.definition.model.kp;

		let va = this.parameters.field2[0].value;
		let vg2 = this.parameters.field2[1].value;
		let vg1 = this.parameters.field2[2].value;
		let ia = this.parameters.field2[3].value;
		let ig2 = this.parameters.field2[4].value;
		let mu = this.parameters.field2[5].value;
		
		let epk = Math.pow(vg2 / kp * Math.log(1 + Math.exp(kp * (1 / mu - vg1 / vg2))), 1.5);
		let kg1 = epk / (ia + ig2);
		let kg2 = epk / ig2;
		
		this.device.definition.model.kg1 = kg1;
		this.device.definition.model.kg2 = kg2;
		this.device.definition.model.mu = mu;
	}
	
	anodePowerPlot() {
		let paMax = this.device.definition.paMax;
		let iaMax = this.parameters.field[4].value;
		let vaMax = this.parameters.field[3].value;

		this.device.definition.vaMax = vaMax;
		this.device.definition.iaMax = iaMax;
		
		let powerCurve = [];
		if (paMax > 0.0) {
		    let startVa = 1000 * paMax / iaMax;
		    for (let i=0; i < 100; i++) {
		        let va = startVa + (vaMax - startVa) * i / 100.0;
		        powerCurve.push({x: va, y: 1000 * paMax / va});
		    }
			
			let dataset = {
				data: powerCurve,
				label: 'Anode power limit(' + paMax.toFixed(3) + 'W)',
				borderColor: 'rgba(191, 0, 0, 1)'
			};
			
			this.anodePowerCurve.push(dataset);
		}
		
		$('#value1').text(this.device.definition.model.mu);
		$('#value2').text(this.device.definition.model.kg1.toFixed(4));
		$('#value3').text(this.device.definition.model.kg2.toFixed(4));
	    $('#value4').text(this.device.definition.model.kp);
		$('#value5').text(this.device.definition.model.alpha.toFixed(4));
		$('#value6').text(this.device.definition.model.beta.toFixed(4));
		$('#value7').text(this.device.definition.model.gamma.toFixed(4));
		$('#value8').text(this.device.definition.model.a);
		
		$('#textA').text(JSON.stringify(this.device.definition, null, "\t"));
	}

	anodePlot() {
		let vg1 = this.parameters.field[0].value;
		let vg1Stop = this.parameters.field[1].value;
		let vg1Step = this.parameters.field[2].value;
		let vaMax = this.parameters.field[3].value;
		let vg2 = this.parameters.field[6].value;

		while (vg1 < vg1Stop + 0.001) {
			if (this.device.model.model.device === "pentode") {
				let pentodeCurve = [];
				let screenCurve = [];
				for (let i = 0; i < 101; i++) {
					let va = vaMax * i / 100.0;
					let ia = this.device.model.anodeCurrent(va, -vg1, vg2) * 1000.0;
					let ig2 = this.device.model.screenCurrent(va, -vg1, vg2) * 1000.0;
					pentodeCurve.push({ x: va, y: ia, vg1: -vg1, vg2: vg2, ig2: ig2 });
					screenCurve.push({ x: va, y: ig2 });
					//if (ia > this.device.definition.iaMax) {
					//	break;
					//}
				}

				let dataset = {
					data: pentodeCurve,
					borderColor: 'rgba(0, 0, 191, 1)'
				};
	
				let screenDataset = {
					data: screenCurve,
					borderColor: 'rgba(0, 191, 191, 1)'
				};

				this.anodeCurves.push(dataset)
				this.anodeCurves.push(screenDataset)
			}
				
		    vg1 += vg1Step;
		}
	}
}