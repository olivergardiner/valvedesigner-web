class ACCathodeFollower extends Circuit {
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
	}
	
	loadLines() {
		let vb = this.parameters.field[0].value;
		let rb = this.parameters.field[1].value;
		let rk = this.parameters.field[2].value;
		let rl = this.parameters.field[3].value;
		let vgMax = this.device.definition.vg1Max;
		let mu = this.device.model.model.mu;
		
		let anodeLoadLine = [];

		let ia = vb / (rb + rk) * 1000.0;
		anodeLoadLine.push({x: 0, y: ia});
		anodeLoadLine.push({x: vb, y: 0});

		let aLLDataset = {
			data: this.drawLoadLine(vb, ia),
			label: 'Cathode load line',
			borderColor: 'rgba(0, 127, 0, 1)'
		};
				
		let cathodeLoadLine = [];
		for (let j = 1; j < 101; j++) {
		    let vg = vgMax * j / 100.0;
		    let ia = vg * 1000.0 / rb;
		    let va = this.device.model.anodeVoltage(ia, -vg);
			if (va > 0.0001) {
				cathodeLoadLine.push({x: va, y: ia});
			}
		}

		let cLLDataset = {
			data: cathodeLoadLine,
			label: 'Bias load line',
			borderColor: 'rgba(0, 0, 127, 1)'
		};
				
		let operatingPoint = intersection(anodeLoadLine, cathodeLoadLine);
		
		this.operatingPointCurves.push(this.showPoint(operatingPoint.point.x, operatingPoint.point.y, 'rgba(0, 255, 0, 1)', 'Operating point'));
		this.operatingPointCurves.push(aLLDataset);
		this.operatingPointCurves.push(cLLDataset);
		
		this.vak = operatingPoint.point.x;
		this.ik = operatingPoint.point.y;
		this.vk = this.ik * (rk + rb) / 1000.0;		
		this.vg = this.ik * rb / 1000.0;
		let gm = 10.0 * (this.device.model.anodeCurrent(this.vak, -(this.vg - 0.05)) - this.device.model.anodeCurrent(this.vak, -(this.vg + 0.05)));
	    let ro = 1.0 / gm;
						
		$('#value1').text(this.vg.toFixed(3));
    	$('#value2').text(this.vk.toFixed(3));
		$('#value3').text(this.ik.toFixed(3));
		$('#value4').text(ro.toFixed(3));
		
		let rac = rk * rl / (rk + rl);
		let vac = this.vak + this.ik * rac / 1000.0;
		let iac = vac / rac;
		let acLLDataset = {
			data: this.drawLoadLine(vac, iac * 1000.0),
			label: 'Cathode load line',
			borderColor: 'rgba(0, 191, 191, 1)'
		};
		this.operatingPointCurves.push(acLLDataset);
	}
}