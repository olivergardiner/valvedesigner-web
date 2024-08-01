let smallSignalTriodes = [
	{
		"name": "12AX7 (Cohen Helie)",
		"vaMax": 300.0,
		"vg1Max": 5.0,
		"vg1Step": 0.5,
		"iaMax": 5.0,
		"paMax": 1.00,
		"model": {
			"device": "triode",
			"type": "cohenHelie",
			"kg1": 458.01,
			"mu": 113.937,
			"x": 1.24521,
			"kp": 826.355,
			"kvb": 0.179676,
			"kvb1": 76.0827,
			"vct": 0.360132
		}
	},
	{
		"name": "12AT7 (Cohen Helie)",
		"vaMax": 300.0,
		"vg1Max": 5.0,
		"vg1Step": 0.5,
		"iaMax": 10.0,
		"paMax": 2.50,
		"model": {
			"device": "triode",
			"type": "cohenHelie",
			"kg1": 458.01,
			"mu": 60.0,
			"x": 1.24521,
			"kp": 826.355,
			"kvb": 0.179676,
			"kvb1": 76.0827,
			"vct": 0.360132
		}
	},
	{
		"name": "6SL7 (Cohen Helie)",
		"vaMax": 500.0,
		"vg1Max": 7.0,
		"vg1Step": 1,
		"iaMax": 5,
		"paMax": 1.0,
		"model": {
			"device": "triode",
			"type": "cohenHelie",
			"kg1": 838.724670637758,
			"kp": 836.5747555448868,
			"kvb": 1019.3745138301402,
			"kvb1": 39.32338286153801,
			"mu": 71.51150378518423,
			"vct": 0,
			"x": 1.302954496063906
		}
	},
	{
		"name": "6SL7 (Ayumi)",
		"vaMax": 500.0,
		"vg1Max": 7.0,
		"vg1Step": 1,
		"iaMax": 5.0,
		"paMax": 1.00,
		"model": {
			"device": "triode",
			"type": "ayumi",
			"vg0": 0.34892993,
			"muc": 65.496168,
			"alpha": 0.37428038333,
			"G": 0.00061341966,
			"xg": 0.4894416362475,
			"Glim": 0.00081896165
		}
	}
];

let smallSignalPentodes = [
	{
		"name": "EF86 (Gardiner)",
		"vaMax": 300.0,
		"vg1Max": 5.0,
		"vg1Step": 0.5,
		"vg2Max": 200.0,
		"iaMax": 8.0,
		"paMax": 1.0,
	    "model": {
	        "a": 0,
	        "alpha": 0.22326092544089068,
	        "ap": 0.006672978113534915,
	        "beta": 0.06223772625903472,
	        "device": "pentode",
	        "gamma": 0.7817432527528245,
	        "kg1": 1001.7723096515919,
	        "kg2": 5804.93760515331,
	        "kg2a": 7086.639092399799,
	        "kp": 167.09108358265513,
	        "kvb": 0.0002488488272816195,
	        "kvb1": 19.817171795904017,
	        "lambda": 63.89644740159917,
	        "mu": 31.948223700799584,
	        "nu": 36.429051709554884,
	        "omega": 302.60893811254397,
	        "os": 0,
	        "psi": 5.257615566348926,
	        "rho": 0.052650651608677386,
	        "s": 0.2643218968596955,
	        "tau": 0.4410939336039371,
	        "theta": 0.8080038819552896,
	        "type": "gardiner",
	        "vct": 0,
	        "x": 1.5633565707452823
	    }
	}
];

let powerTriodes = [
	
];

let powerPentodes = [
	
];