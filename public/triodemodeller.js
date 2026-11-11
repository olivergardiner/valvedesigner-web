class TriodeModeller extends Circuit {
	constructor(ctx) {
		super(ctx);
		
		this.parameters = {
			nFields: 6,
			field: [
				{ name: 'Grid Start', value: 0 },
				{ name: 'Grid Stop', value: 6 },
				{ name: 'Grid Step', value: 0.5 },
				{ name: 'Max Anode Voltage', value: 500 },
				{ name: 'Max Anode Current', value: 10 },
				{ name: 'Max Anode Power', value: 1 }
			],
			nFields2: 4,
			field2: [
				{ name: 'Anode Voltage', value: 250 },
				{ name: 'Grid Voltage', value: 1.0 },
				{ name: 'Anode Current', value: 0.5 },
				{ name: 'Mu', value: 100 }
			],
			nValues: 7,
			value: [
				'Mu',
				'Kg1',
				'Kp',
				'x',
				'Vct',
				'Kvb',
				'Kvb1'
			]
		};
		
		this.kpMax = 200;
		
		this.vctPotFactor = 0.5;
		this.kvbPotFactor = 0.5;
		this.kvb1PotFactor = 0.5;
		this.kpPotFactor = 0.5;
		this.xPotFactor = 0.5;
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
		
		this.device.definition.static.va = this.parameters.field2[0].value;
		this.device.definition.static.vg1 = this.parameters.field2[1].value;
		this.device.definition.static.ia = this.parameters.field2[2].value;

		this.device.definition.name = $('#deviceName').val();

		this.kpMax = this.device.definition.model.mu * 10.0;

		$('#kp').val(inversePotFunction((this.device.definition.model.kp - 1) / this.kpMax, this.kpPotFactor) * 200);
		$('#x').val(inversePotFunction(this.device.definition.model.x - 1, this.xPotFactor) * 200);
		
		this.setBackgroundSize();
				
		this.updateModel();

		this.showPlots();
	}
	
	setBackgroundSize() {
		if (this.device.definition.iaMax < 5.1) {
			$('#triodeChart').css('background-size', '557px 440px');
			$('#triodeChart').css('background-position', '31px 33px');
		} else if (this.device.definition.iaMax < 10.0) {
			$('#triodeChart').css('background-size', '569px 440px');
			$('#triodeChart').css('background-position', '19px 33px');
		} else if (this.device.definition.iaMax < 100.0) {
			$('#triodeChart').css('background-size', '562px 440px');
			$('#triodeChart').css('background-position', '26px 33px');
		} else {
			$('#triodeChart').css('background-size', '556px 440px');
			$('#triodeChart').css('background-position', '32px 33px');
		}
	}
	
	updateSliders() {
		let vctValue = potFunction($('#vct').val() / 200, this.vctPotFactor);
		let kvbValue = potFunction($('#kvb').val() / 200, this.kvbPotFactor);
		let kvb1Value = potFunction($('#kvb1').val() / 200, this.kvb1PotFactor);
		let kpValue = potFunction($('#kp').val() / 200, this.kpPotFactor);
		let xValue = potFunction($('#x').val() / 200, this.xPotFactor);
						
		this.device.definition.model.kp = kpValue * this.kpMax + 1;
		this.device.definition.model.x = xValue + 1;
		this.device.definition.model.vct = vctValue;
		this.device.definition.model.kvb = kvbValue * 1000;
		this.device.definition.model.kvb1 = kvb1Value * 100;

		this.updateModel();
		
		this.showPlots();
	}

	onDeviceLoad() {
		this.kpMax = this.device.definition.model.mu * 10.0;
							
		$('#kp').val(inversePotFunction((this.device.definition.model.kp - 1) / this.kpMax, this.kpPotFactor) * 200);
        $('#x').val(inversePotFunction(this.device.definition.model.x - 1, this.xPotFactor) * 200);
		$('#vct').val(potFunction(this.device.definition.model.vct, this.vctPotFactor) * 200);
		$('#kvb').val(potFunction(this.device.definition.model.kvb / 1000, this.kvbPotFactor) * 200);
		$('#kvb1').val(potFunction(this.device.definition.model.kvb1 / 100, this.kvb1PotFactor) * 200);
		
		this.parameters.field[0].value = 0.0;
		this.parameters.field[1].value = this.device.definition.vg1Max;
		this.parameters.field[2].value = this.device.definition.vg1Step;
		this.parameters.field[3].value = this.device.definition.vaMax;
		this.parameters.field[4].value = this.device.definition.iaMax;
		this.parameters.field[5].value = this.device.definition.paMax;
		
		$('#field2').val(this.device.definition.vg1Max);
		$('#field3').val(this.device.definition.vg1Step);
		$('#field4').val(this.device.definition.vaMax);
		$('#field5').val(this.device.definition.iaMax);
		$('#field6').val(this.device.definition.paMax);
		
		this.parameters.field2[0].value = this.device.definition.static.va;
		this.parameters.field2[1].value = this.device.definition.static.vg1;
		this.parameters.field2[2].value = this.device.definition.static.ia;
		this.parameters.field2[3].value = this.device.definition.model.mu;
		
		$('#field9').val(this.device.definition.static.va);
		$('#field10').val(this.device.definition.static.vg1);
		$('#field11').val(this.device.definition.static.ia);
		$('#field12').val(this.device.definition.model.mu);
		
		this.setBackgroundSize();

		this.updateModel();
	}
	
	updateModel() {
		let vct = this.device.definition.model.vct;
		let kvb = this.device.definition.model.kvb;
		let kvb1 = this.device.definition.model.kvb1;
		let kp = this.device.definition.model.kp;
		let x = this.device.definition.model.x;

		let va = this.parameters.field2[0].value;
		let vg1 = this.parameters.field2[1].value;
		let ia = this.parameters.field2[2].value;
		let mu = this.parameters.field2[3].value;
		
		let f = Math.sqrt(kvb + va * kvb1 + va * va);
		let epk = Math.pow(va / kp * Math.log(1 + Math.exp(kp * (1 / mu + (vct - vg1) / f))), x);
		let kg1 = epk / ia;
		
		this.device.definition.model.kg1 = kg1;
		this.device.definition.model.mu = mu;
	}
	
	setBackground(file) {
		let reader = new FileReader();
		reader.onload = function (e) {
		    const uploaded_image = reader.result;
		    $('#triodeChart').css('backgroundImage', `url(${uploaded_image})`);
		}
		reader.readAsDataURL(file);
		
		this.setBackgroundSize();
	}
	
	anodePowerPlot() {
		this.device.definition.vaMax = this.parameters.field[3].value;
		this.device.definition.iaMax = this.parameters.field[4].value;
		this.addDissipationCurve();

		$('#value1').text(this.device.definition.model.mu);
		$('#value2').text(this.device.definition.model.kg1.toFixed(6));
		$('#value3').text(this.device.definition.model.kp.toFixed(6));
	    $('#value4').text(this.device.definition.model.x.toFixed(6));
		$('#value5').text(this.device.definition.model.vct.toFixed(6));
		$('#value6').text(this.device.definition.model.kvb.toFixed(6));
		$('#value7').text(this.device.definition.model.kvb1.toFixed(6));
		
		$('#textA').text(JSON.stringify(this.device.definition, null, "\t"));
	}

	anodePlot() {
		if (this.device.definition.model.device !== 'triode') return;
		const fields = this.parameters.field;
		const family = sampleGridFamily(fields[0].value, fields[1].value, fields[2].value, grid =>
			sampleAnodeCurve(this.device.model, fields[3].value, -grid));
		this.anodeCurves = family.map(curve => lineDataset(curve.points, 'rgba(0, 0, 191, 1)'));
	}
}