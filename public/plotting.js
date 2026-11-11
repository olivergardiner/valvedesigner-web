/** Chart.js presentation only; curve generation lives in curves.js. */
function lineDataset(data, color = 'rgba(0, 0, 0, 1)', label) {
	const dataset = {data, borderColor: color};
	if (label !== undefined) dataset.label = label;
	return dataset;
}

function pointDataset(x, y, color, label = null) {
	return {...lineDataset([{x, y}], color, label), pointBackgroundColor: color, pointStyle: 'circle', pointRadius: 5};
}

function dissipationDataset(data, power) {
	return lineDataset(data, 'rgba(191, 0, 0, 1)', 'Anode power limit(' + power.toFixed(3) + 'W)');
}

function characteristicChartConfig(definition, datasets, title) {
	return {
		type : 'line',
		indexAxis : 'x',
		data : { datasets: datasets },
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
					text : title,
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
					max : definition.vaMax,
					beginAtZero : true
				},
				y : {
					min: 0,
					max : definition.iaMax,
					beginAtZero : true
				}
			},
			layout: {
			}
		}
	};
}
