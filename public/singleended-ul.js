class SingleEndedUL extends Circuit {
	constructor(ctx) {
		super(ctx);
		
		this.parameters = {
			nFields: 4,
			field: [
				{ name: 'Supply voltage', value: 300 },
				{ name: 'Screen tap', value: 0.5 },
				{ name: 'Bias current (anode)', value: 30 },
				{ name: 'Anode to anode load', value: 8000 }
			],
			nValues: 4,
			value: [
				'Bias point (V)',
				'Cathode current (mA)',
				'Cathode resistor (ohms)',
				'Max output power (W)'
			]
		};
	}
	
	anodePowerPlot() {
		let paMax = this.device.definition.paMax;
		let iaMax = this.device.definition.iaMax;
		let vaMax = this.device.definition.vaMax;
		
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
	}
	
	anodePlot() {
		if (this.device.model.model.device === "pentode") {
			$('#fLabel1').show();
			$('#field1').show();
		} else {
			$('#fLabel1').hide();
			$('#field1').hide();
		}
		
		let vb = this.parameters.field[0].value;
		let vg1Step = this.device.definition.vg1Step;
		let vg1Max = this.device.definition.vg1Max;
		let vg2Tap = this.parameters.field[1].value;
		let vg1 = 0.0;
		let k = -1;
		let i = 0;
		while (vg1 < vg1Max + 0.001) {
			if (Math.abs(this.vk - vg1) < vg1Step) {
				if (k == -1) {
					k = i;
				}
			}
			let anodeCurve = [];
			anodeCurve.push({x: 0, y: 0});
		    for (let i = 1; i < 101; i++) {
		        let va = this.device.definition.vaMax * i / 100.0;
				let vg2 = va * vg2Tap + vb * (1.0 - vg2Tap);
				let ia = this.device.model.anodeCurrent(va, -vg1, vg2) * 1000.0;
		        anodeCurve.push({x: va, y: ia});
		    }
			
			let dataset = {
				data: anodeCurve,
				borderColor: 'rgba(0, 0, 0, 1)'
			};
			
			this.anodeCurves.push(dataset)
		    vg1 += vg1Step;
			i++;
		}
	}
	
	loadLines() {
		let vb = this.parameters.field[0].value;
		let ia = this.parameters.field[2].value;
		let raa = this.parameters.field[3].value;
		let vg1Max = this.device.definition.vg1Max;
		let vg2Tap = this.parameters.field[1].value;
		
		let iaMaxB = 4000.0 * vb / raa;
		let classBLoadLine = [];

		classBLoadLine.push({x: 0, y: iaMaxB});
		classBLoadLine.push({x: vb, y: 0});
		
		let gradient = -2000.0 / raa;
		let iaMaxA = ia - gradient * vb;
		let vaMaxA = -iaMaxA / gradient;
		
		let acLoadLine = [];
		for (let i = 0; i < 101; i++) {
			let va = i * vaMaxA / 100;
			let ia2 = iaMaxA - va * 2000.0 / raa;
			
			acLoadLine.push({ x: va, y: ia2 });
		}
		
		let acLLDataset = {
			data: acLoadLine,
			label: 'AC load line',
			borderColor: 'rgba(0, 127, 0, 1)'
		};
		
		let anodeCurve0 = [];
		for (let i = 1; i < 101; i++) {
		    let va = this.device.definition.vaMax * i / 100.0;
			let vg2 = va * vg2Tap + vb * (1.0 - vg2Tap);
			let ia = this.device.model.anodeCurrent(va, 0.0, vg2) * 1000.0;
		    anodeCurve0.push({x: va, y: ia});
		}

		let powerLimit = intersection(anodeCurve0, acLoadLine);
		let ouptutPower = (vb - powerLimit.point.x) * powerLimit.point.y / 2000.0;
		
		let iErrMin = 1000.0;
		for (let i = 0; i < 101; i++) {
			let vg1 = i * vg1Max / 100;
			let iErr = Math.abs(ia - 1000.0 * this.device.model.anodeCurrent(vb, -vg1, vb));
			if (iErr < iErrMin) {
				iErrMin = iErr;
				this.vk = vg1;
			}
		}
		
		let ik = ia;
		
		if (this.device.model.model.device === "pentode") {
			ik += 1000.0 * this.device.model.screenCurrent(vb, -this.vk, vb);
		}
		
		let rk = 1000.0 * this.vk / (ik * 2);
		
		$('#value1').text(this.vk.toFixed(3));
		$('#value2').text(ik.toFixed(3));
		$('#value3').text(rk.toFixed(3));
		$('#value4').text(ouptutPower.toFixed(3));

		this.operatingPointCurves.push(this.showPoint(vb, ia, 'rgba(0, 255, 0, 1)', 'Operating point (vg = ' + this.vk.toFixed(3) + 'V)'));
		this.operatingPointCurves.push(acLLDataset);
	}
}