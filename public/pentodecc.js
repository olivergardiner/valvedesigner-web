class PentodeCC extends Circuit {
	constructor(ctx) {
		super(ctx);
		
		this.parameters = {
			nFields: 5,
			field: [
				{ name: 'Supply voltage', value: 280 },
				{ name: 'Cathode resistor Rk', value: 680 },
				{ name: 'Anode resistor Ra', value: 82000 },
				{ name: 'Screen resistor Rs', value: 300000 },
				{ name: 'Load impedance Rl', value: 1000000 }
			],
			nValues: 8,
			value: [
				'Bias point Vk (V)',
				'Anode voltage (V)',
				'Anode current (mA)',
				'Screen voltage (V)',
				'Screen current (mA)',
				'gm (mA/V)',
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
				let ia = this.device.model.anodeCurrent(va, -vg1, this.vg2) * 1000.0;
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

		//let ra = this.parameters.field[2].value;
		//let rl = this.parameters.field[4].value;
		//let scale = rl / (ra + rl);
		//let gainPoint = intersection(this.anodeCurves[k].data, this.operatingPointCurves[1].data);
		//let deltaVa = this.va - gainPoint.point.x;
		//let deltaVg1 = this.vk - k * vg1Step;
		//let gain = scale * deltaVa / deltaVg1;
		//$('#value8').text(gain.toFixed(3));
	}
	
	loadLines() {
		this.calculateOperatingPoint(false, 0.5);
		let ratio = this.va / this.parameters.field[0].value;
		this.calculateOperatingPoint(true, ratio);
	}
	
	calculateOperatingPoint(showChart, ratio) {
		let vb = this.parameters.field[0].value;
		let rk = this.parameters.field[1].value;
		let ra = this.parameters.field[2].value;
		let rs = this.parameters.field[3].value;
		let rl = this.parameters.field[4].value;
		let vgMax = this.device.definition.vg1Max;
		let vaMax = this.device.definition.vaMax;

		let vaTest = vaMax * ratio;
		
		let screenLoadLine = [];

		let ig2 = vb / (rs + rk) * 1000.0;
		screenLoadLine.push({x: 0, y: ig2});
		screenLoadLine.push({x: vb, y: 0});
				
		let cathodeLoadLine = [];
		for (let j = 1; j < 101; j++) {
			let vg1 = vgMax * j / 100.0;
			let ik = vg1 * 1000.0 / rk;
			let vg2 = this.device.model.screenVoltage(ik, vaTest, -vg1);
			let ig2 = 1000.0 * this.device.model.screenCurrent(vaTest, -vg1, vg2);
			let ia = 1000.0 * this.device.model.anodeCurrent(vaTest, -vg1, vg2);

			cathodeLoadLine.push({x: vg2, y: ig2, vg1: vg1, ia: ia});
		}
				
		let screenOperatingPoint = intersection(screenLoadLine, cathodeLoadLine);
		
		this.vg2 = screenOperatingPoint.point.x;
		this.ig2 = screenOperatingPoint.point.y;
		
		let j = screenOperatingPoint.j;
		let vg1Test = cathodeLoadLine[j].vg1;
		let iaTest = this.device.model.anodeCurrent(vaTest, -vg1Test, this.vg2);
		
		cathodeLoadLine = [];

		for (let j = 1; j < 101; j++) {
		    let va = vaMax * j / 100.0;
		    let ia = 1000.0 * this.device.model.anodeCurrent(va, -vg1Test, this.vg2);
		    cathodeLoadLine.push({x: va, y: ia});
		}
		
		let cLLDataset = {
			data: cathodeLoadLine,
			label: 'Cathode load line',
			borderColor: 'rgba(0, 0, 127, 1)'
		};
		
		let anodeLoadLine = [];

		let ia = vb / (ra + rk) * 1000.0;
		anodeLoadLine.push({x: 0, y: ia});
		anodeLoadLine.push({x: vb, y: 0});

		let aLLDataset = {
			data: this.drawLoadLine(vb, ia),
			label: 'Anode load line',
			borderColor: 'rgba(0, 127, 0, 1)'
		};
		
		let anodeOperatingPoint = intersection(anodeLoadLine, cathodeLoadLine);
				
		this.va = anodeOperatingPoint.point.x;
		this.ia = anodeOperatingPoint.point.y;
		
		let ik = this.ia + this.ig2;
		this.vg1 = ik * rk / 1000;
		
		let gm = 10000.0 * (this.device.model.anodeCurrent(this.va, -(this.vg1 - 0.05), this.vg2) - this.device.model.anodeCurrent(this.va, -(this.vg1 + 0.05), this.vg2));
	    let gain = ra * rl / ((ra + rl) * 1000.0 * (1.0 / gm + rk / 1000.0));
		let gainBP = gm * ra * rl / ((ra + rl) * 1000.0);
		
		$('#value1').text(this.vg1.toFixed(3));
    	$('#value2').text(this.va.toFixed(3));
		$('#value3').text(this.ia.toFixed(3));
		$('#value4').text(this.vg2.toFixed(3));
		$('#value5').text(this.ig2.toFixed(3));
		$('#value6').text(gm.toFixed(3));
		$('#value7').text(gain.toFixed(3));
		$('#value8').text(gainBP.toFixed(3));

		if (showChart) {
			this.operatingPointCurves.push(this.showPoint(anodeOperatingPoint.point.x, anodeOperatingPoint.point.y, 'rgba(0, 255, 0, 1)', 'Operating point'));
			this.operatingPointCurves.push(aLLDataset);
			this.operatingPointCurves.push(cLLDataset);
		}
	}
}