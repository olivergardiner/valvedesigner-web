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
			"a": 0.0011,
			"alpha": 0.68,
			"beta": 0.0744047619047619,
			"device": "pentode",
			"gamma": 0.6000000000000001,
			"kg1": 0.7895042924594784,
			"kg2": 4.473857657270378,
			"kp": 120,
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
			"a": 0.0008,
			"alpha": 0,
			"beta": 0.041666666666666664,
			"device": "pentode",
			"gamma": 0.6000000000000001,
			"kg1": 0.275564082964226,
			"kg2": 2.5802818677559345,
			"kp": 240,
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
			"a": 0.0008,
			"alpha": 0,
			"beta": 0.0289,
			"device": "pentode",
			"gamma": 0.6,
			"kg1": 0.3353,
			"kg2": 2.586,
			"kp": 43,
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
			"a": 0.0036,
			"alpha": 0.06,
			"beta": 0.038580246913580245,
			"device": "pentode",
			"gamma": 1.52,
			"kg1": 0.5152649950837948,
			"kg2": 6.097302441824905,
			"kp": 45,
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