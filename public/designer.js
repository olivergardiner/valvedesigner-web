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

class Circuit {
	constructor(ctx) {
		this.ctx = ctx;
		this.chart = null;
		this.parameters = {
			nFields: 0,
			field: [],
			nValues: 0,
			value: []
		};
	}
	
	loadDevice(device) {
		let thisCircuit = this;
		jQuery.ajax({
		    type: "get",
		    url: "devices/" + device,
		    contentType: 'application/json'
		}).then(function(data, status, jqxhr){
		    if (data != null) {
				thisCircuit.setDevice(data);
		    }
		});
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
		
	setDevice(device) {
		this.device = new Device(structuredClone(device));

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
	
	showPlots() {
		if (this.chart != null) {
			this.chart.destroy();
		}
		
		this.anodeCurves = [];
		this.operatingPointCurves = [];
		this.anodePowerCurve = [];

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
						text : 'Anode Characteristic Graph',
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
	}
	
	anodePlot() {
	}
	
	loadLines() {
	}
	
	anodePlot() {
	}
}

class Device {
	constructor(definition) {
		this.definition = definition;
		
		if (this.definition.model.device === "triode") {
			if (definition.model.type === "cohenHelie") {
				this.model = new CohenHelieTriode(definition.model);
			}
		}
	}

	getDefinition()	{
		return this.definition;
	}

	getModel()	{
		return this.model;
	}
}

class Model {
	constructor(model) {
		this.model = model;
	}
	
	anodeCurrent(anodeVoltage, gridVoltage, screenVoltage = 0, secondaryEmission = true) {
		return 0;
	}
	
	anodeVoltage(cathodeCurrent, gridVoltage, screenVoltage = 0, secondaryEmission = true) {
		return 0;
	}

	anodeVoltage(ia, vg1, vg2 = 0, secondaryEmission = true) {
		let va = 100.0;
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
}

class CohenHelieTriode extends Model {
	constructor(model) {
		super(model);
	}

	anodeCurrent(anodeVoltage, gridVoltage, screenVoltage = 0, secondaryEmission = true) {
		return this.cohenHelieCurrent(anodeVoltage, gridVoltage);
	}
	
	cohenHelieCurrent(anodeVoltage, gridVoltage) {
		return this.cohenHelieEpk(anodeVoltage, gridVoltage) / this.model.kg1;
	}
	
	cohenHelieEpk(voltage, gridVoltage) {
		let f = Math.sqrt(this.model.kvb + voltage * this.model.kvb1 + voltage * voltage);
		let y = this.model.kp * (1.0 / this.model.mu + (gridVoltage + this.model.vct) / f);
		let ep = voltage / this.model.kp * Math.log(1.0 + Math.exp(y));
		return Math.pow(ep, this.model.x);
	}
}