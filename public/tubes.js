// Representative datasheet fits. Full previous catalogue: ../docs/design/model-catalogue-archive.md.
// Model coefficients and static reference points are preserved; fitting templates are separate.
let smallSignalTriodes = [
	{
		"name": "12AX7",
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
		"name": "12AY7",
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
		"name": "12AT7",
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
		"name": "12AU7",
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
		"name": "6SL7",
		"vaMax": 300,
		"vg1Max": 7,
		"vg1Step": 1,
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
		"name": "6SN7",
		"vaMax": 600,
		"vg1Max": 24,
		"vg1Step": 2,
		"iaMax": 20,
		"paMax": 2.5,
		"model": {
			"device": "triode",
			"type": "cohenHelie",
			"kg1": 0.58793056630399,
			"mu": 22,
			"x": 1.19,
			"kp": 172,
			"kvb": 415,
			"kvb1": 19,
			"vct": 0.3
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
		"name": "EF86",
		"vaMax": 300,
		"vg1Max": 5,
		"vg1Step": 0.5,
		"vg2Max": 200,
		"iaMax": 7,
		"paMax": 1,
		"model": {
			"a": 0.00011026057076361423,
			"alpha": 1.153901493234544,
			"beta": 0.07134703196347032,
			"device": "pentode",
			"gamma": 0.44396181474968055,
			"kg1": 0.8521637261808357,
			"kg2": 3.4086549047233428,
			"kp": 210.375,
			"mu": 33,
			"type": "simple"
		},
		"static": {
			"va": 250,
			"vg2": 140,
			"vg1": 2,
			"ia": 3,
			"ig2": 1
		}
	},
	{
		"name": "EF37A",
		"vaMax": 300,
		"vg1Max": 5,
		"vg1Step": 0.5,
		"vg2Max": 200,
		"iaMax": 7,
		"paMax": 1,
		"model": {
			"a": 0.00006916309815344662,
			"alpha": 0.17093149988842213,
			"beta": 0.1370614035087719,
			"device": "pentode",
			"gamma": 0.5358997975606364,
			"kg1": 1.0173267721591885,
			"kg2": 4.069307088636754,
			"kp": 196.5,
			"mu": 22,
			"type": "simple"
		},
		"static": {
			"va": 250,
			"vg2": 140,
			"vg1": 2,
			"ia": 3,
			"ig2": 1
		}
	}
];

let powerTriodes = [];

let powerPentodes = [
	{
		"name": "EL84",
		"vaMax": 500,
		"vg1Max": 20,
		"vg1Step": 2,
		"vg2Max": 300,
		"iaMax": 200,
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
		"name": "6F6",
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
		}
	},
	{
		"name": "6L6GC",
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
		"name": "6550",
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
		"name": "KT88",
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
	},
	{
		"name": "GU50",
		"vaMax": 1000,
		"vg1Max": 60,
		"vg1Step": 5,
		"vg2Max": 250,
		"iaMax": 400,
		"paMax": 40,
		"model": {
			"a": 0,
			"alpha": 0.007690659496746631,
			"beta": 0.025656814449917895,
			"device": "pentode",
			"gamma": 0.5047554463761547,
			"kg1": 0.45526221492098334,
			"kg2": 3.368940390415277,
			"kp": 13.6,
			"mu": 8,
			"type": "simple"
		},
		"static": {
			"va": 400,
			"vg2": 250,
			"vg1": 20,
			"ia": 160,
			"ig2": 25
		}
	}
];
