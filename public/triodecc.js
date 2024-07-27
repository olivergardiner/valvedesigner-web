class TriodeCC extends Circuit {
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
		let vg1Step = this.device.definition.vg1Step;
		let vg1Max = this.device.definition.vg1Max;
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
				let ia = this.device.model.anodeCurrent(va, -vg1) * 1000.0;
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

		let ra = this.parameters.field[2].value;
		let rl = this.parameters.field[3].value;
		let scale = rl / (ra + rl);
		let gainPoint = intersection(this.anodeCurves[k].data, this.operatingPointCurves[1].data);
		let deltaVa = this.va - gainPoint.point.x;
		let deltaVg1 = this.vk - k * vg1Step;
		let gain = scale * deltaVa / deltaVg1;
		$('#value5').text(gain.toFixed(3));
	}
	
	loadLines() {
		let vb = this.parameters.field[0].value;
		let rk = this.parameters.field[1].value;
		let ra = this.parameters.field[2].value;
		let rl = this.parameters.field[3].value;
		let vgMax = this.device.definition.vg1Max;
		let mu = this.device.model.model.mu;
		
		let anodeLoadLine = [];

		let ia = vb / (ra + rk) * 1000.0;
		anodeLoadLine.push({x: 0, y: ia});
		anodeLoadLine.push({x: vb, y: 0});

		let aLLDataset = {
			data: this.drawLoadLine(vb, ia),
			label: 'Anode load line',
			borderColor: 'rgba(0, 127, 0, 1)'
		};
				
		let cathodeLoadLine = [];
		for (let j = 1; j < 101; j++) {
		    let vg = vgMax * j / 100.0;
		    let ia = vg * 1000.0 / rk;
		    let va = this.device.model.anodeVoltage(ia, -vg);
			cathodeLoadLine.push({x: va, y: ia});
		}

		let cLLDataset = {
			data: cathodeLoadLine,
			label: 'Cathode load line',
			borderColor: 'rgba(0, 0, 127, 1)'
		};
				
		let operatingPoint = intersection(anodeLoadLine, cathodeLoadLine);
		
		this.operatingPointCurves.push(this.showPoint(operatingPoint.point.x, operatingPoint.point.y, 'rgba(0, 255, 0, 1)', 'Operating point'));
		this.operatingPointCurves.push(aLLDataset);
		this.operatingPointCurves.push(cLLDataset);
		
		this.va = operatingPoint.point.x;
		this.ia = operatingPoint.point.y;
		
		this.vk = this.ia * rk / 1000.0;
		
		let ia1 = this.device.model.anodeCurrent(vb, -this.vk);
		let ia2 = this.device.model.anodeCurrent(vb - 10.0, -this.vk);
		let ar = 10.0 / (ia1 - ia2);

		let re = ra * rl / (ra + rl);
		let ark = ar + rk * (mu + 1.0);
		let gain = mu * re / (re + ark);
		let gainBP = mu * re / (re + ar);
		
		$('#value1').text(this.vk.toFixed(3));
    	$('#value2').text(this.va.toFixed(3));
		$('#value3').text(this.ia.toFixed(3));
		$('#value4').text(gain.toFixed(3));
		$('#value5').text(gainBP.toFixed(3));
	}
}