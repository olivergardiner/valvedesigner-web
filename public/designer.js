/**
 * Code to model various tube amplifier circuits using a variety of tube models
 */

function intersection(series1, series2) {
	for (let i = 0; i < series1.length - 1; i++) {
	    let p1 = series1[i];
	    let p2 = series1[i + 1];
	    for (let j = 0; j < series2.length - 1; j++) {
	        let p3 = series2[j];
	        let p4 = series2[j + 1];
	        let a1 = p2.y - p1.y;
	        let b1 = p1.x - p2.x;
	        let c1 = a1 * p1.x + b1 * p1.y;
	        let a2 = p4.y - p3.y;
	        let b2 = p3.x - p4.x;
	        let c2 = a2 * p3.x + b2 * p3.y;
	        let d = a1 * b2 - a2 * b1;
	        if (d != 0.0) {
	            let x = (b2 * c1 - b1 * c2) / d;
	            let y = (a1 * c2 - a2 * c1) / d;

	            let onLine1 = x > Math.min(p1.x, p2.x) && x < Math.max(p1.x, p2.x) && y > Math.min(p1.y, p2.y) && y < Math.max(p1.y, p2.y);
	            let onLine2 = x > Math.min(p3.x, p4.x) && x < Math.max(p3.x, p4.x) && y > Math.min(p3.y, p4.y) && y < Math.max(p3.y, p4.y);

	            if (onLine1 && onLine2) {
	                return {point: {x: x, y: y}, i: i ,j: j};
	            }
	        }
	    }
	}

	return {point: {x: 0, y: 0}, i: -1 , j: -1};
}

function uramp(x) {
	return x < 0.0 ? 0.0 : x;
}

function u(x) {
	return x < 0.0 ? 0.0 : 1.0;
}

function smin(x, y, k) {
	k *= 1.0;
	let r = Math.exp(-x/k) + Math.exp(-y/k);
	return -k * Math.log(r);
}

function smax(x, y, k) {
	return -smin(-x, -y, k);
}

function potFunction(x, factor) {
	let b = Math.pow(1.0 / factor - 1.0, 2);
	
	if (b == 1.0) {
		return x;
	}
	
	let a = 1.0 / (b - 1.0);
	
	return a * (Math.pow(b, x) - 1.0);
}

function inversePotFunction(y, factor) {
	let b = Math.pow(1.0 / factor - 1.0, 2);
	
	if (b == 1.0) {
		return y;
	}
	
	let a = 1.0 / (b - 1.0);
	
	return Math.log(y / a + 1.0) / Math.log(b);
}

class Circuit {
	constructor(ctx) {
		this.ctx = ctx;
		this.pentodeCtx = null;
		this.chart = null;
		this.pentodeChart = null;
		this.parameters = {
			nFields: 0,
			field: [],
			nValues: 0,
			value: []
		};
	}
	
	loadSingleDevice(tube) {
		this.device = new Device(tube);

		this.onDeviceLoad();
	
		this.showPlots(); 
	}
	
	loadDevice(tubeList, index) {
		
		this.device = new Device(structuredClone(tubeList[index]));
		
		this.onDeviceLoad();

		this.showPlots(); 
	}
	
	onDeviceLoad() {
	}
	
	buildTubeList(tubeList) {
		for (let i = 0; i < tubeList.length; i++) {
			$('#tubeSelect').append('<option value="' + i + '">' + tubeList[i].name + '</option>');
		}
	}
	
	configureParameters() {
		for (let i = 0; i < 8; i++) {
			if (i < this.parameters.nFields) {
				$('#fLabel' + (i + 1)).text(this.parameters.field[i].name);
				$('#field' + (i + 1)).val(this.parameters.field[i].value);
				$('#fLabel' + (i + 1)).show();
				$('#field' + (i + 1)).show();
			} else {
				$('#fLabel' + (i + 1)).hide();
				$('#field' + (i + 1)).hide();
			}
		}
		
		for (let i = 0; i < 8; i++) {
			if (i < this.parameters.nValues) {
				$('#vLabel' + (i + 1)).text(this.parameters.value[i]);
				$('#vLabel' + (i + 1)).show();
				$('#value' + (i + 1)).show();
			} else {
				$('#vLabel' + (i + 1)).hide();
				$('#value' + (i + 1)).hide();
			}
		}
	}
	
	updateParameters() {		
		for (let i = 0; i < this.parameters.nFields; i++) {
			this.parameters.field[i].value = parseFloat($('#field' + (i + 1)).val());
			$('#field' + (i + 1)).text(this.parameters.field[i].value);
		}
		
		this.showPlots();
	}
			
	showPoint(x, y, color, label = null) {
		let point = { x: x, y: y };
		let dataset = {
			data: [point],
			label: label,
			borderColor: color,
			pointBackgroundColor: color,
			pointStyle: 'circle',
			pointRadius: 5
		};
		
		return dataset;
	}
	
	drawLoadLine(vb1, iaMax1, vb2 = 0, iaMax2 = 0) {
		let loadLine = [];
		for (let i = 0; i < 101; i++) {
			let va1 = i * vb1 / 100;
			let ia1 = iaMax1 * (1.0 - i / 100);
			
			loadLine.push({ x: va1, y: ia1 });
		}
		
		return loadLine;
	}
	
	showPlots() {
		if (this.chart != null) {
			this.chart.destroy();
		}
		
		if (this.pentodeChart != null) {
			this.pentodeChart.destroy();
			this.pentodeChart = null;
		}
		
		this.anodeCurves = [];
		this.operatingPointCurves = [];
		this.anodePowerCurve = [];
		this.pentodeCurves = [];
		this.screenCurves = [];

		this.loadLines();
		
		this.anodePlot();

		this.anodePowerPlot();

		this.drawChart();
	}
		
	drawChart() {
		let chart = {
			type : 'line',
			indexAxis : 'x',
			data : { datasets: this.operatingPointCurves.concat(this.anodePowerCurve).concat(this.anodeCurves) },
			options : {
				animation: false,
				responsive : true,
				maintainAspectRatio:false,
				stacked : false,
				hoverMode : 'index',
				elements: {
					point: {
						pointStyle: false
					}
				},
				plugins: {
					title : {
						display : true,
						text : 'Anode Characteristic Graph: ' + this.device.definition.name,
					},
					legend : {
						display : false,
						labels : {
							fontColor : 'rgb(255, 99, 132)'
						}
					}
				},
				scales : {
					x : {
						type : 'linear',
						max : this.device.definition.vaMax,
						beginAtZero : true
					},
					y : {
						max : this.device.definition.iaMax,
						beginAtZero : true
					}
				}
			}
		};
	
		this.chart = new Chart(this.ctx, chart);
		
		if (this.pentodeCtx != null) {
			this.showPentodeChart();
		}
	}
	
	showPentodeChart() {
		if (this.device.model.model.device === "pentode") {
			let pentodeChart = {
				type : 'line',
				indexAxis : 'x',
				data : { datasets: this.pentodeCurves.concat(this.screenCurves) },
				options : {
					animation: false,
					responsive : true,
					maintainAspectRatio:false,
					stacked : false,
					hoverMode : 'index',
					elements: {
						point: {
							pointStyle: false
						}
					},
					plugins: {
						title : {
							display : true,
							text : 'Pentode Characteristic Graph: ' + this.device.definition.name,
						},
						legend : {
							display : false,
							labels : {
								fontColor : 'rgb(255, 99, 132)'
							}
						}
					},
					scales : {
						x : {
							type : 'linear',
							max : this.device.definition.vaMax,
							beginAtZero : true
						},
						y : {
							max : this.device.definition.iaMax,
							beginAtZero : true
						}
					}
				}
			};
	
			this.pentodeChart = new Chart(this.pentodeCtx, pentodeChart);
		}
	}
	
	anodePlot() {
	}
	
	loadLines() {
	}
	
	anodePowerPlot() {
	}
	
	downloadJSON() {
	}
}

class Device {
	constructor(definition) {
		this.definition = definition;
		
		if (this.definition.model.device === "triode") {
			if (definition.model.type === "cohenHelie") {
				this.model = new CohenHelieTriode(definition.model);
			} else if (definition.model.type === "ayumi") {
				this.model = new AyumiTriode(definition.model);
			}
		} else if (this.definition.model.device === "pentode") {
			if (definition.model.type === "gardiner") {
				this.model = new GardinerPentode(definition.model);
			} else if (definition.model.type === "simple") {
				this.model = new SimplePentode(definition.model);
			}
		}
	}
}

class Model {
	constructor(model) {
		this.model = model;
	}
	
	anodeCurrent(va, vg1, vg2 = 0, secondaryEmission = true) {
		return 0;
	}
	
	screenCurrent(va, vg1, vg2, secondaryEmission = true) {
		return 0;
	}
	
	cathodeCurrent(va, vg1, vg2, secondaryEmission = true) {
		return this.anodeCurrent(va, vg1, vg2, secondaryEmission) + this.screenCurrent(va, vg1, vg2, secondaryEmission);
	}
	
	anodeVoltage(ia, vg1, vg2 = 0, secondaryEmission = true) {
		let va = 300.0;
		let tolerance = 1.2;
	
		let iaTest = 1000.0 * this.anodeCurrent(va, vg1, vg2, secondaryEmission);
		let gradient = 100.0 * (1000.0 * this.anodeCurrent(va + 0.01, vg1, vg2, secondaryEmission) - iaTest);
		let iaErr = ia - iaTest;
	
		let count = 0;
		while (Math.abs(iaErr) > 0.005 && count++ < 1000) {
		    if (gradient != 0.0) {
		        let vaNext = va + iaErr / gradient;
		        if (vaNext < 0.0) {
		            vaNext = 0.0;
		        }
		        if (vaNext < va / tolerance) { // use the gradient but limit step to tolerance
		            vaNext = va / tolerance;
		        }
		        if (vaNext > tolerance * va) { // use the gradient but limit step to tolerance
		            vaNext = tolerance * va;
		        }
		        va = vaNext;
		    } else {
		        break;
		    }
		    iaTest = 1000.0 * this.anodeCurrent(va, vg1, vg2, secondaryEmission);
		    gradient = 100.0 * (1000.0 * this.anodeCurrent(va + 0.01, vg1, vg2, secondaryEmission) - iaTest);
		    iaErr = ia - iaTest;
		}
	
		return va;
	}
	
	screenVoltage(ik, va, vg1, secondaryEmission = true) {
		let vg2 = 500.0;
		let tolerance = 1.2;

		let ikTest = 1000.0 * this.cathodeCurrent(va, vg1, vg2, secondaryEmission);
		let gradient = 100.0 * (1000.0 * this.cathodeCurrent(va, vg1, vg2 + 0.01, secondaryEmission) - ikTest);
		let ikErr = ik - ikTest;

		let count = 0;
		while (Math.abs(ikErr) > 0.005 && count++ < 1000) {
			if (gradient != 0.0) {
				let vg2Next = vg2 + ikErr / gradient;
				if (vg2Next < 0.0) {
					vg2Next = 0.0;
				}
				if (vg2Next < vg2 / tolerance) { // use the gradient but limit step to tolerance
					vg2Next = vg2 / tolerance;
				}
				if (vg2Next > tolerance * vg2) { // use the gradient but limit step to tolerance
					vg2Next = tolerance * vg2;
				}
				vg2 = vg2Next;
			} else {
				break;
			}
			ikTest = 1000.0 * this.cathodeCurrent(va, vg1, vg2, secondaryEmission);
			gradient = 100.0 * (1000.0 * this.cathodeCurrent(va, vg1, vg2 + 0.01, secondaryEmission) - ikTest);
			ikErr = ik - ikTest;
		}

		return vg2;
	}
}

class CohenHelieTriode extends Model {
	constructor(model) {
		super(model);
	}

	anodeCurrent(anodeVoltage, gridVoltage, screenVoltage = 0, secondaryEmission = true) {
		return this.cohenHelieEpk(anodeVoltage, gridVoltage) / (this.model.kg1 * 1000.0);
	}
	
	cohenHelieEpk(voltage, gridVoltage) {
		let f = Math.sqrt(this.model.kvb + voltage * this.model.kvb1 + voltage * voltage);
		let y = this.model.kp * (1.0 / this.model.mu + (gridVoltage + this.model.vct) / f);
		let ep = voltage / this.model.kp * Math.log(1.0 + Math.exp(y));
		return Math.pow(ep, this.model.x);
	}
}

class AyumiTriode extends Model {
	constructor(model) {
		super(model);

		this.a = 1.0 / (1.0 - this.model.alpha);
		this.b = 1.5 - this.a;
		this.c = 3.0 * this.model.alpha - 1.0;
		this.mum = this.model.muc * 0.6666666666 * this.a;
		this.model.mu = this.mum;
	}

	anodeCurrent(anodeVoltage, gridVoltage, screenVoltage = 0, secondaryEmission = true) {
		let vgg = gridVoltage + this.model.vg0;
		
		let y1 = this.c / (2.0 * this.model.muc);
		let m1 = Math.pow(y1 * uramp(anodeVoltage) + 1E-10, this.b);
		
		let y2 = 3.0 / (2.0 * this.a);
		let m2 = Math.pow(y2 * uramp(vgg + uramp(anodeVoltage)/this.model.muc) + 1E-10, this.a);

		let y3 = this.model.G * Math.pow(this.a * this.c / 3.0, this.b);
		let ip = y3 * Math.pow(uramp(vgg + uramp(anodeVoltage)/this.mum) + 1E-10, 1.5);
		
		let ik = this.model.G * m1 * m2;
		let ig = 0.0;
		if (vgg > 0.0) {
			ik = ip;
			let y4 = this.model.xg * this.model.Glim;
			ig = y4 * Math.pow(uramp(vgg), 1.5) * (uramp(gridVoltage) / (uramp(anodeVoltage) + uramp(gridVoltage)) * 1.2 + 0.4);
		}
		
		let iplim = (1.0 - this.model.xg) * this.model.Glim * Math.pow(uramp(anodeVoltage), 1.5);
		let ia = Math.min(ik - ig, iplim);
		
		return ia;
	}
}

class GardinerPentode extends CohenHelieTriode {
	constructor(model) {
		super(model);
	}

	anodeCurrent(va, vg1, vg2 = 0, secondaryEmission = true) {
		let epk = this.cohenHelieEpk(vg2, vg1);
		let k = 1.0 / this.model.kg1 - 1.0 / this.model.kg2;
		let shift = this.model.beta * (1.0 - this.model.alpha * vg1);
		let g = Math.exp(-Math.pow(shift * va, this.model.gamma));
		let scale = 1.0 - g;
		let vco = vg2 / this.model.lambda - vg1 * this.model.nu - this.model.omega;
		let psec = this.model.s * va * (1.0 + Math.tanh(-this.model.ap * (va - vco)));
		let ia = epk * (k * scale + this.model.a * va / this.model.kg2) + this.model.os * vg2;
		
		if(secondaryEmission) {
		    ia = ia - epk * psec / this.model.kg2;
		}

		return Math.max(ia, 0.0) / 1000;
	}

	screenCurrent(va, vg1, vg2, secondaryEmission = true) {
		let epk = this.cohenHelieEpk(vg2, vg1);
		let shift = this.model.rho * (1.0 - this.model.tau * vg1);
		let h = Math.exp(-Math.pow(shift * va, this.model.theta * 0.9));
		let vco = vg2 / this.model.lambda - vg1 * this.model.nu - this.model.omega;
		let psec = this.model.s * va * (1.0 + Math.tanh(-this.model.ap * (va - vco)));
		let ig2 = epk * (1.0 + this.model.psi * h) / this.model.kg2a - epk * this.model.a * va / this.model.kg2a;

		if(secondaryEmission) {
		    ig2 = ig2 + epk * psec / this.model.kg2a;
		}

		return Math.max(ig2, 0.0) / 1000;
	}
}

class SimplePentode extends Model {
	constructor(model) {
		super(model);
	}

	anodeCurrent(va, vg1, vg2 = 0, secondaryEmission = true) {
		let epk = this.simpleEpk(vg2, vg1);
		let k = 1.0 / this.model.kg1 - 1.0 / this.model.kg2;
		let shift = this.model.beta * (1.0 - this.model.alpha * vg1);
		let g = Math.exp(-Math.pow(shift * va, this.model.gamma));
		let scale = 1.0 - g;
		let a = this.model.a;
		let ia = epk * (k * scale + a * va / this.model.kg1);
		
		return Math.max(ia, 0.0) / 1000;
	}

	screenCurrent(va, vg1, vg2, secondaryEmission = true) {
		let epk = this.simpleEpk(vg2, vg1);
		let shift = this.model.beta * (1.0 - this.model.alpha * vg1);
		let g = Math.exp(-Math.pow(shift * va, this.model.gamma));
		let psi = this.model.kg2 / this.model.kg1 - 1.0;
		let scale = 1.0 + psi * g;
		let a = this.model.a;
		let ig2 = epk * (scale - a * va) / this.model.kg2;

		return Math.max(ig2, 0.0) / 1000;
	}
	
	simpleEpk(voltage, gridVoltage) {
		let y = this.model.kp * (1.0 / this.model.mu + gridVoltage / voltage);
		let ep = voltage / this.model.kp * Math.log(1.0 + Math.exp(y));
		return Math.pow(ep, 1.5);
	}
}