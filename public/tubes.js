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
			"kg1": 0.45801,
			"mu": 113.937,
			"x": 1.24521,
			"kp": 826.355,
			"kvb": 0.179676,
			"kvb1": 76.0827,
			"vct": 0.360132
		}
	},
	{
		"name": "12AX7 (Cohen Helie - DS)",
		"vaMax": 300,
		"vg1Max": 5,
		"vg1Step": 0.5,
		"iaMax": 5,
		"paMax": 1,
		"model": {
			"device": "triode",
			"type": "cohenHelie",
			"kg1": 0.899682072661792,
			"mu": 100,
			"x": 1.52,
			"kp": 806,
			"kvb": 3,
			"kvb1": 12.5,
			"vct": 0.505
		},
		"static": {
			"va": 250,
			"vg1": 2,
			"ia": 1.2
		}
	},
	{
		"name": "12AY7 (Cohen Helie - DS)",
		"vaMax": 300,
		"vg1Max": 5,
		"vg1Step": 1,
		"iaMax": 10,
		"paMax": 1.5,
		"model": {
			"device": "triode",
			"type": "cohenHelie",
			"kg1": 2.189584103263982,
			"mu": 42,
			"x": 1.7850000000000001,
			"kp": 343,
			"kvb": 60,
			"kvb1": 0,
			"vct": 0.97
		},
		"static": {
			"va": 150,
			"vg1": 0,
			"ia": 6.8
		}
	},
	{
		"name": "12AT7 (Cohen Helie - DS)",
		"vaMax": 300,
		"vg1Max": 8,
		"vg1Step": 1,
		"iaMax": 30,
		"paMax": 2.5,
		"model": {
			"device": "triode",
			"type": "cohenHelie",
			"kg1": 0.22773737557928625,
			"mu": 75,
			"x": 1.4849999999999999,
			"kp": 238,
			"kvb": 0,
			"kvb1": 0,
			"vct": 0.185
		},
		"static": {
			"va": 250,
			"vg1": 2,
			"ia": 10
		}
	},
	{
		"name": "12AU7 (Cohen Helie - DS)",
		"vaMax": 300,
		"vg1Max": 25,
		"vg1Step": 5,
		"iaMax": 30,
		"paMax": 2.75,
		"model": {
			"device": "triode",
			"type": "cohenHelie",
			"kg1": 0.8924220046985567,
			"mu": 20,
			"x": 1.405,
			"kp": 75,
			"kvb": 5,
			"kvb1": 0,
			"vct": 0.05
		},
		"static": {
			"va": 250,
			"vg1": 8.5,
			"ia": 10.5
		}
	},
	{
		"name": "6SL7 (Cohen Helie)",
		"vaMax": 300.0,
		"vg1Max": 7.0,
		"vg1Step": 1,
		"iaMax": 5,
		"paMax": 1.0,
		"model": {
			"device": "triode",
			"type": "cohenHelie",
			"kg1": 0.838724670637758,
			"kp": 836.5747555448868,
			"kvb": 1019.3745138301402,
			"kvb1": 39.32338286153801,
			"mu": 71.51150378518423,
			"vct": 0,
			"x": 1.302954496063906
		}
	},
	{
		"name": "6SL7 (Cohen Helie - DS)",
		"vaMax": 300,
		"vg1Max": 5,
		"vg1Step": 1.0,
		"iaMax": 5,
		"paMax": 1,
		"model": {
			"device": "triode",
			"type": "cohenHelie",
			"kg1": 1.1421165218853864,
			"mu": 79,
			"x": 1.445,
			"kp": 749.8,
			"kvb": 55,
			"kvb1": 0,
			"vct": 0.785
		},
		"static": {
			"va": 250,
			"vg1": 2,
			"ia": 2.3
		}
	},
	{
		"name": "6SL7 (Ayumi)",
		"vaMax": 300.0,
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
	},
	{
		"name": "6SN7 (Cohen Helie - DS)",
		"vaMax": 600,
		"vg1Max": 24,
		"vg1Step": 2,
		"iaMax": 20,
		"paMax": 2.5,
		"model": {
			"device": "triode",
			"type": "cohenHelie",
			"kg1": 1.568481554777002,
			"mu": 20,
			"x": 1.5350000000000001,
			"kp": 201,
			"kvb": 15,
			"kvb1": 7.000000000000001,
			"vct": 1
		},
		"static": {
			"va": 250,
			"vg1": 8,
			"ia": 9
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
		"iaMax": 7.0,
		"paMax": 1.0,
	    "model": {
	        "a": 0,
	        "alpha": 0.22326092544089068,
	        "ap": 0.006672978113534915,
	        "beta": 0.06223772625903472,
	        "device": "pentode",
	        "gamma": 0.7817432527528245,
	        "kg1": 1.0017723096515919,
	        "kg2": 5.80493760515331,
	        "kg2a": 7.086639092399799,
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
	},
	{
		"name": "EF86",
		"vaMax": 500,
		"vg1Max": 5,
		"vg1Step": 0.5,
		"vg2Max": 425,
		"iaMax": 7,
		"paMax": 1,
		"model": {
			"a": 0.00021161569045872653,
			"alpha": 1.9588322038563184,
			"beta": 0.1286008230452675,
			"device": "pentode",
			"gamma": 0.3923612049725016,
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
		"name": "EF37A (Simple)",
		"vaMax": 500,
		"vg1Max": 4,
		"vg1Step": 0.5,
		"vg2Max": 425,
		"iaMax": 10,
		"paMax": 1,
		"model": {
			"a": 0,
			"alpha": 0.37125122681739386,
			"beta": 0.07387706855791962,
			"device": "pentode",
			"gamma": 0.6824726245870135,
			"kg1": 0.7559245494365968,
			"kg2": 3.5906416098238347,
			"kp": 66.8,
			"mu": 28,
			"type": "simple"
		}
	}
];

let powerTriodes = [
	
];

let powerPentodes = [
	{
		"name": "EL84 (Simple)",
		"vaMax": 500,
		"vg1Max": 20,
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
		"name": "EL84 (Gardiner)",
		"vaMax": 500.0,
		"vg1Max": 20.0,
		"vg1Step": 2.0,
		"vg2Max": 300.0,
		"iaMax": 200.0,
		"paMax": 12.0,
	    "model": {
			"a": 0.0010052181343767285,
			"alpha": 0.19165036248136916,
			"ap": 0.03919149632421822,
			"beta": 0.07739864678550698,
			"device": "pentode",
			"gamma": 1.041470388355175,
			"kg1": 0.22792835876459188,
			"kg2": 1.1551845578486564,
			"kg2a": 1.5236515627284884,
			"kp": 113.61400562980995,
			"kvb": 0.0002756070069261475,
			"kvb1": 9.861899976573032,
			"lambda": 9.065824072105586,
			"mu": 19.095754567541896,
			"nu": 2.6576210668247353,
			"omega": 25.488429387121528,
			"os": 0,
			"psi": 3.2365080971974973,
			"rho": 0.06924587880176518,
			"s": 0.051884969430402786,
			"tau": 0.2919814920715803,
			"theta": 1.1530557369841832,
			"type": "gardiner",
			"vct": 0,
			"x": 1.4422204679974964
	    }
	},
	{
		"name": "6F6 (Simple)",
		"vaMax": 500,
		"vg1Max": 30,
		"vg1Step": 5,
		"vg2Max": 425,
		"iaMax": 100,
		"paMax": 11,
		"model": {
			"a": 0.00012950731295561965,
			"alpha": 0,
			"beta": 0.0377415458937198,
			"device": "pentode",
			"gamma": 0.5280662911532314,
			"kg1": 1.424627804668891,
			"kg2": 8.876527090629242,
			"kp": 23.95,
			"mu": 9,
			"type": "simple"
		},
		"static": {
			"va": 250,
			"vg2": 250,
			"vg1": 15.7,
			"ia": 34,
			"ig2": 6.5
		}
	},
	{
		"name": "6P6S (Gardiner)",
		"vaMax": 500.0,
		"vg1Max": 40.0,
		"vg1Step": 2.0,
		"vg2Max": 300.0,
		"iaMax": 200.0,
		"paMax": 12.0,
		"model": {
		    "a": 0,
		    "alpha": 0.08724470928913307,
		    "ap": 0.013268035792376558,
		    "beta": 0.047745910679198374,
		    "device": "pentode",
		    "gamma": 1.6656226232598144,
		    "kg1": 0.727472351946776,
		    "kg2": 4.401298112104643,
		    "kg2a": 6.8696204858446545,
		    "kp": 43.341722786548395,
		    "kvb": 0.004397360458967084,
		    "kvb1": 9.888040489058593,
		    "lambda": 12.1477849600883,
		    "mu": 10.092576007612656,
		    "nu": 4.889971011341804,
		    "omega": 106.47178016112831,
		    "os": 0.01606589341714421,
		    "psi": 4.601389823959966,
		    "rho": 0.04254812321730151,
		    "s": 0.054369662983504247,
		    "tau": 0.1130304130130717,
		    "theta": 1.873051811600415,
		    "type": "gardiner",
		    "vct": 0.9813645989090846,
		    "x": 1.3972457909749572
		}
	},
	{
		"name": "6V6G (Gardiner)",
		"vaMax": 500.0,
		"vg1Max": 40.0,
		"vg1Step": 2.0,
		"vg2Max": 300.0,
		"iaMax": 200.0,
		"paMax": 12.0,
		"model": {
		    "a": 0,
		    "alpha": 0.09574626890944907,
		    "ap": 0.011382284130443713,
		    "beta": 0.03987224767534003,
		    "device": "pentode",
		    "gamma": 1.738870971866816,
		    "kg1": 0.6155562045268366,
		    "kg2": 4.503399195063655,
		    "kg2a": 8.819482403522743,
		    "kp": 49.95564641524816,
		    "kvb": 0.002393975769410444,
		    "kvb1": 12.645379900570143,
		    "lambda": 11.605472307978287,
		    "mu": 9.95077715680817,
		    "nu": 4.475848979974136,
		    "omega": 236.6035716610977,
		    "os": 0.008211639163896431,
		    "psi": 6.713434951932913,
		    "rho": 0.03620270336075135,
		    "s": 1.8861062241161966,
		    "tau": 0.1184590438120546,
		    "theta": 2.1424617723338235,
		    "type": "gardiner",
		    "vct": 0.579593605403866,
		    "x": 1.373660922091252
		}
	},
	{
		"name": "EL34B (Gardiner)",
		"vaMax": 500.0,
		"vg1Max": 60.0,
		"vg1Step": 5.0,
		"vg2Max": 425.0,
		"iaMax": 350.0,
		"paMax": 25.0,
		"model": {
		    "a": 0.00025656324993623618,
		    "alpha": 0.07208142408461662,
		    "ap": 0.03274497439889081,
		    "beta": 0.038131577082097565,
		    "device": "pentode",
		    "gamma": 1.351835329965012,
		    "kg1": 0.24821858265463703,
		    "kg2": 1.3733902975113433,
		    "kg2a": 1.436863500757774,
		    "kp": 39.313671803783265,
		    "kvb": 0.0005390437242350074,
		    "kvb1": 17.674558848769763,
		    "lambda": 15.996286740675487,
		    "mu": 13.117774689918551,
		    "nu": 1.2796677517146444,
		    "omega": 0.27382462002581487,
		    "os": 0,
		    "psi": 3.5452821892205333,
		    "rho": 0.037977586693425755,
		    "s": 0.032427245691739624,
		    "tau": 0.07320791137457032,
		    "theta": 1.376461336350171,
		    "type": "gardiner",
		    "vct": 0,
		    "x": 1.4757805517155946
		}
	},
	{
		"name": "EL34 (Simple)",
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
		}
	},
	{
		"name": "6L6GC (Simple)",
		"vaMax": 700,
		"vg1Max": 60,
		"vg1Step": 4,
		"vg2Max": 425,
		"iaMax": 300,
		"paMax": 30,
		"model": {
			"a": 0.00022318368351353425,
			"alpha": 0.04395792791986384,
			"beta": 0.025656814449917895,
			"device": "pentode",
			"gamma": 1.343603556768485,
			"kg1": 0.8416820743236144,
			"kg2": 13.971922433771999,
			"kp": 49.150000000000006,
			"mu": 9,
			"type": "simple"
		},
		"static": {
			"va": 250,
			"vg2": 250,
			"vg1": 11,
			"ia": 78,
			"ig2": 5
		}
	},
	{
		"name": "6550 (Simple)",
		"vaMax": 700,
		"vg1Max": 50,
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
	},
	{
		"name": "KT88 (Simple)",
		"vaMax": 700,
		"vg1Max": 50,
		"vg1Step": 5,
		"vg2Max": 500,
		"iaMax": 500,
		"paMax": 42,
		"model": {
			"a": 0.000441061315567188,
			"alpha": 0.07860114921345941,
			"beta": 0.07387706855791962,
			"device": "pentode",
			"gamma": 0.7686448086636275,
			"kg1": 0.4406590580975518,
			"kg2": 6.316113166064909,
			"kp": 34.199999999999996,
			"mu": 8,
			"type": "simple"
		},
		"static": {
			"va": 250,
			"vg2": 250,
			"vg1": 14,
			"ia": 160,
			"ig2": 12
		}
	}
];