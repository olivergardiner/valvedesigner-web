let templates = [
	{
		"name": "EF86",
		"vaMax": 500,
		"vg1Max": 5,
		"vg1Step": 0.5,
		"vg2Max": 425,
		"iaMax": 7,
		"paMax": 1,
		"model": {
			"a": 0.00021453708605602247,
			"alpha": 0.8367782973740393,
			"beta": 0.07387706855791962,
			"device": "pentode",
			"gamma": 0.5047554463761547,
			"kg1": 0.7675456195156042,
			"kg2": 4.34942517725509,
			"kp": 128.3,
			"mu": 38,
			"type": "simple"
		},
		"static": {
			"va": 250,
			"vg2": 140,
			"vg1": 2,
			"ia": 2.8,
			"ig2": 0.6
		}
	},
	{
		"name": "EL84",
		"vaMax": 500,
		"vg1Max": 10,
		"vg1Step": 2,
		"vg2Max": 425,
		"iaMax": 175,
		"paMax": 12,
		"model": {
			"a": 0.00010563855354021828,
			"alpha": 0.007690659496746631,
			"beta": 0.0377415458937198,
			"device": "pentode",
			"gamma": 0.6740460197242499,
			"kg1": 0.2792606906121809,
			"kg2": 2.6148955575504207,
			"kp": 145.4,
			"mu": 19,
			"type": "simple"
		},
		"static": {
			"va": 250,
			"vg2": 250,
			"vg1": 7.3,
			"ia": 46,
			"ig2": 5.5
		}
	},
	{
		"name": "EL34",
		"vaMax": 500,
		"vg1Max": 60,
		"vg1Step": 5,
		"vg2Max": 425,
		"iaMax": 350,
		"paMax": 25,
		"model": {
			"a": 0.00010806191740838546,
			"alpha": 0,
			"beta": 0.0334941050375134,
			"device": "pentode",
			"gamma": 0.48172643603947773,
			"kg1": 0.32556939684611785,
			"kg2": 2.5105989058804656,
			"kp": 47.75,
			"mu": 11,
			"type": "simple"
		},
		"static": {
			"va": 250,
			"vg2": 250,
			"vg1": 12.2,
			"ia": 100.0,
			"ig2": 14.9
		}
	},
	{
		"name": "6550",
		"vaMax": 500,
		"vg1Max": 20,
		"vg1Step": 5,
		"vg2Max": 500,
		"iaMax": 500,
		"paMax": 42,
		"model": {
			"a": 0.0002988045303647948,
			"alpha": 0.060986035387992875,
			"beta": 0.03460686600221484,
			"device": "pentode",
			"gamma": 2.2,
			"kg1": 0.507581996119715,
			"kg2": 6.006386954083294,
			"kp": 59.4,
			"mu": 8,
			"type": "simple"
		},
		"static": {
			"va": 250,
			"vg2": 250,
			"vg1": 14,
			"ia": 130,
			"ig2": 12
		}
	}
];