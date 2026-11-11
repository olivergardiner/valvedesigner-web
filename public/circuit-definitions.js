/** Circuit metadata for the shared workspace; triode metadata also feeds a retired regression adapter. */
const designerCircuitDefinitions = [{
	id: 'triodecc',
	title: 'Triode common cathode',
	category: 'Small-signal amplifier',
	summary: 'Explore the operating point of a cathode-biased triode stage.',
	devices: () => smallSignalTriodes,
	calculate: calculateTriodeCC,
	schematic: 'triodecc.png',
	schematicAlt: 'Common-cathode triode with anode resistor Ra, cathode resistor Rk, bypass capacitor Ck and load Rl.',
	parameters: [
		{key: 'supplyVoltage', label: 'Supply voltage', symbol: 'B+', unit: 'V', scale: 1, defaultValue: 300, legacyLabel: 'Supply voltage'},
		{key: 'cathodeResistance', label: 'Cathode resistor', symbol: 'Rk', unit: 'kΩ', scale: 1000, defaultValue: 1000, legacyLabel: 'Cathode resistor Rk'},
		{key: 'anodeResistance', label: 'Anode resistor', symbol: 'Ra', unit: 'kΩ', scale: 1000, defaultValue: 100000, legacyLabel: 'Anode resistor Ra'},
		{key: 'loadResistance', label: 'Load impedance', symbol: 'Rl', unit: 'kΩ', scale: 1000, defaultValue: 1000000, legacyLabel: 'Load impedance Rl'}
	],
	outputs: [
		{path: 'operatingPoint.cathodeVoltage', label: 'Cathode bias', symbol: 'Vk', unit: 'V', legacyLabel: 'Bias point Vk (V)'},
		{path: 'operatingPoint.anodeVoltage', label: 'Anode voltage', symbol: 'Va', unit: 'V', legacyLabel: 'Anode voltage (V)'},
		{path: 'operatingPoint.anodeCurrent', label: 'Anode current', symbol: 'Ia', unit: 'mA', legacyLabel: 'Anode current (mA)'},
		{path: 'gain.unbypassed', label: 'Gain · unbypassed', unit: 'V/V', legacyLabel: 'Gain (unbypassed)'},
		{path: 'gain.bypassed', label: 'Gain · bypassed', unit: 'V/V', legacyLabel: 'Gain (bypassed)'}
	],
	series: [
		{point: 'operatingPoint', color: 'rgba(0, 255, 0, 1)', label: 'Operating point'},
		{curve: 'anodeLoadLine', color: 'rgba(0, 127, 0, 1)', label: 'Anode load line'},
		{curve: 'cathodeLoadLine', color: 'rgba(0, 0, 127, 1)', label: 'Cathode load line'}
	],
	help: [
		'With the grid referenced to ground, the current through Rk raises the cathode voltage and biases the grid negative relative to the cathode. The operating point is where the anode load line meets the curved cathode-bias line.',
		'An unbypassed cathode resistor introduces local negative feedback and reduces gain. A sufficiently large bypass capacitor Ck reduces that feedback for AC signals. Both gain estimates are shown; Rl represents the load on the stage.',
		'Voltages on the characteristic plot are relative to the cathode. The red dashed curve shows the selected model’s anode dissipation limit; it is a reference curve, not an enforced constraint.'
	]
}];

// Remaining circuit definitions use the same calculation contracts as the original tools.
designerCircuitDefinitions.push({
	id: 'pentodecc',
	title: "Pentode common cathode",
	category: "Small-signal amplifier",
	summary: "Explore pentode bias, screen current and gain with a resistive anode load.",
	devices: () => smallSignalPentodes,
	calculate: calculatePentodeCC,
	schematic: 'pentodecc.png',
	schematicAlt: "Pentode common cathode circuit schematic, with component labels matching the inputs.",
	resultsHeading: "Operating point & gain",
	resultNote: "",
	parameters: [
		{
			"key": "supplyVoltage",
			"label": "Supply voltage",
			"symbol": "B+",
			"unit": "V",
			"scale": 1,
			"defaultValue": 280,
			"legacyLabel": "Supply voltage"
		},
		{
			"key": "cathodeResistance",
			"label": "Cathode resistor",
			"symbol": "Rk",
			"unit": "kΩ",
			"scale": 1000,
			"defaultValue": 680,
			"legacyLabel": "Cathode resistor Rk"
		},
		{
			"key": "anodeResistance",
			"label": "Anode resistor",
			"symbol": "Ra",
			"unit": "kΩ",
			"scale": 1000,
			"defaultValue": 82000,
			"legacyLabel": "Anode resistor Ra"
		},
		{
			"key": "screenResistance",
			"label": "Screen resistor",
			"symbol": "Rs",
			"unit": "kΩ",
			"scale": 1000,
			"defaultValue": 300000,
			"legacyLabel": "Screen resistor Rs"
		},
		{
			"key": "loadResistance",
			"label": "Load impedance",
			"symbol": "Rl",
			"unit": "kΩ",
			"scale": 1000,
			"defaultValue": 1000000,
			"legacyLabel": "Load impedance Rl"
		}
	],
	outputs: [
		{
			"path": "operatingPoint.cathodeVoltage",
			"label": "Cathode bias",
			"unit": "V",
			"legacyLabel": "Bias point Vk (V)"
		},
		{
			"path": "operatingPoint.anodeVoltage",
			"label": "Anode voltage",
			"unit": "V",
			"legacyLabel": "Anode voltage (V)"
		},
		{
			"path": "operatingPoint.anodeCurrent",
			"label": "Anode current",
			"unit": "mA",
			"legacyLabel": "Anode current (mA)"
		},
		{
			"path": "operatingPoint.screenVoltage",
			"label": "Screen voltage",
			"unit": "V",
			"legacyLabel": "Screen voltage (V)"
		},
		{
			"path": "operatingPoint.screenCurrent",
			"label": "Screen current",
			"unit": "mA",
			"legacyLabel": "Screen current (mA)"
		},
		{
			"path": "transconductance",
			"label": "Transconductance",
			"unit": "mA/V",
			"legacyLabel": "gm (mA/V)"
		},
		{
			"path": "gain.unbypassed",
			"label": "Gain · unbypassed",
			"unit": "V/V",
			"legacyLabel": "Gain (unbypassed)"
		},
		{
			"path": "gain.bypassed",
			"label": "Gain · bypassed",
			"unit": "V/V",
			"legacyLabel": "Gain (bypassed)"
		}
	],
	series: [
		{
			"point": "operatingPoint",
			"color": "rgba(0, 255, 0, 1)",
			"label": "Operating point",
			"legendLabel": "Operating point"
		},
		{
			"curve": "anodeLoadLine",
			"color": "rgba(0, 127, 0, 1)",
			"label": "Anode load line",
			"legendLabel": "Anode load line"
		},
		{
			"curve": "cathodeLoadLine",
			"color": "rgba(0, 0, 127, 1)",
			"label": "Cathode load line",
			"legendLabel": "Cathode load line"
		}
	],
	help: [
		"The Pentode Common Cathode Amplifier is similar in principle to the triode amplifier but the pentode version has the advantage of offering both higher gain and higher output swing. Because the anode is no longer a controlling element (its only job is to sit there collecting the electrons passing through the screen), the anode curves more closely resemble those of a transistor and the increase in available swing is easily seen by the fact that the anode curves cover far more of the anode load line than is the case for triodes.",
		"In this circuit, the screen voltage (which controls the gain of the pentode) is set by the screen resistor and, at the bias point, means that the screen is at a voltage below the supply voltage determined by the quiescent screen current and the screen resistor. If the screen resistor is not bypassed then it will also introduce a degree of local negative feedback as the screen voltage will vary with signal. In some circuits, the screen is decoupled to ground but it should be decoupled to the cathode as it is the cathode to screen voltage that determines the anode current.",
		"In guitar amplifiers, a pentode gain stage can offer a couple of useful characteristics: 1) the markedly different anode curves (compared to a triode) offer a slightly different way of colouring the sound due to natural distortion, and 2) a suitable choice of screen capacitor leads to a level of natural compression determined by the time constant of the screen resistor and capacitor. For example, an EF86 with a screen resistor of 300k and a screen bypass capacitor of 47nF yields a time constant of 14mS, which is likely to suit most guitar players."
	]
});
designerCircuitDefinitions.push({
	id: 'accathodefollower',
	title: "AC cathode follower",
	category: "Small-signal buffer",
	summary: "Find the bias point and output impedance of an AC coupled triode buffer.",
	devices: () => smallSignalTriodes,
	calculate: calculateACCathodeFollower,
	schematic: 'accathodefollower.png',
	schematicAlt: "AC cathode follower circuit schematic, with component labels matching the inputs.",
	resultsHeading: "Operating point & impedance",
	resultNote: "",
	parameters: [
		{
			"key": "supplyVoltage",
			"label": "Supply voltage",
			"symbol": "B+",
			"unit": "V",
			"scale": 1,
			"defaultValue": 300,
			"legacyLabel": "Supply voltage"
		},
		{
			"key": "biasResistance",
			"label": "Bias resistor",
			"symbol": "Rb",
			"unit": "kΩ",
			"scale": 1000,
			"defaultValue": 620,
			"legacyLabel": "Anode resistor Rb"
		},
		{
			"key": "cathodeResistance",
			"label": "Cathode resistor",
			"symbol": "Rk",
			"unit": "kΩ",
			"scale": 1000,
			"defaultValue": 47000,
			"legacyLabel": "Cathode resistor Rk"
		},
		{
			"key": "loadResistance",
			"label": "Load impedance",
			"symbol": "Rl",
			"unit": "kΩ",
			"scale": 1000,
			"defaultValue": 100000,
			"legacyLabel": "Load impedance Rl"
		}
	],
	outputs: [
		{
			"path": "operatingPoint.biasVoltage",
			"label": "Bias voltage",
			"unit": "V",
			"legacyLabel": "Bias point Vb (V)"
		},
		{
			"path": "operatingPoint.cathodeVoltage",
			"label": "Cathode voltage",
			"unit": "V",
			"legacyLabel": "Cathode voltage (V)"
		},
		{
			"path": "operatingPoint.cathodeCurrent",
			"label": "Cathode current",
			"unit": "mA",
			"legacyLabel": "Cathode current (mA)"
		},
		{
			"path": "outputImpedance",
			"label": "Output impedance",
			"unit": "Ω",
			"legacyLabel": "Output impedance (ohms)"
		}
	],
	series: [
		{
			"point": "operatingPoint",
			"color": "rgba(0, 255, 0, 1)",
			"label": "Operating point",
			"legendLabel": "Operating point"
		},
		{
			"curve": "anodeLoadLine",
			"color": "rgba(0, 127, 0, 1)",
			"label": "Cathode load line",
			"legendLabel": "DC load line"
		},
		{
			"curve": "cathodeLoadLine",
			"color": "rgba(0, 0, 127, 1)",
			"label": "Bias load line",
			"legendLabel": "Bias load line"
		},
		{
			"curve": "acLoadLine",
			"color": "rgba(0, 191, 191, 1)",
			"label": "Cathode load line",
			"legendLabel": "AC load line"
		}
	],
	help: [
		"The AC Cathode Follower, like all followers provides no gain (it actually introduces a very slight loss) but operates as a buffer that isolates a high impedance source from a low impedance drive. Because of the AC coupling on both the input and the output, the bias point is not affected by input DC voltage or output load but the AC load seen by the cathode is the cathode resistor in parallel with the load impedance. This means that the AC load line is rotated about the bias point and it is important understand the effect this has on output swing if the follower will be driving a heavy load. Remember that the grid to cathode voltage is not the input signal and it is the maximum swing (the input and output are the same) that is determined by the limits of the load line before the grid to cathode voltage becomes positive or the valve is cut off.",
		"The load line is drawn in exactly the same way as for the Triode Common Cathode Amplifier as the voltage from anode to cathode is simply determined by the current flowing through the triode and the total resistance in the anode to cathode path. This means that the DC voltage on the cathode is actually the supply voltage minus the voltage across the triode. Remember to check whether heater elevation will be required to keep the valve within maximum ratings.",
		"Note that the input of the AC Cathode Follower is bootstrapped because the AC voltage on either end of the grid resistor is essentially identical - this means that practically no signal current flows in the grid resistor and so the input impedance is much higher than the value of the grid resistor. In turn, this means that the input capacitor can be quite small without there being any effect on low frequencies."
	]
});
designerCircuitDefinitions.push({
	id: 'dccathodefollower',
	title: "DC cathode follower",
	category: "Driver & buffer",
	summary: "Explore a triode gain stage and its directly coupled cathode follower.",
	devices: () => smallSignalTriodes,
	calculate: calculateDCCathodeFollower,
	schematic: 'dccathodefollower.png',
	schematicAlt: "DC cathode follower circuit schematic, with component labels matching the inputs.",
	resultsHeading: "Driver & follower",
	resultNote: "",
	parameters: [
		{
			"key": "supplyVoltage",
			"label": "Supply voltage",
			"symbol": "B+",
			"unit": "V",
			"scale": 1,
			"defaultValue": 300,
			"legacyLabel": "Supply voltage"
		},
		{
			"key": "cathodeResistance",
			"label": "Cathode resistor",
			"symbol": "Rk",
			"unit": "kΩ",
			"scale": 1000,
			"defaultValue": 1500,
			"legacyLabel": "Cathode resistor Rk"
		},
		{
			"key": "anodeResistance",
			"label": "Anode resistor",
			"symbol": "Ra",
			"unit": "kΩ",
			"scale": 1000,
			"defaultValue": 100000,
			"legacyLabel": "Anode resistor Ra"
		},
		{
			"key": "loadResistance",
			"label": "Load impedance",
			"symbol": "Rl",
			"unit": "kΩ",
			"scale": 1000,
			"defaultValue": 82000,
			"legacyLabel": "Load impedance Rl"
		}
	],
	outputs: [
		{
			"path": "operatingPoint.cathodeVoltage",
			"label": "Driver cathode bias",
			"unit": "V",
			"legacyLabel": "Bias point Vk (V)"
		},
		{
			"path": "operatingPoint.anodeVoltage",
			"label": "Driver anode voltage",
			"unit": "V",
			"legacyLabel": "Anode voltage (V)"
		},
		{
			"path": "operatingPoint.anodeCurrent",
			"label": "Driver anode current",
			"unit": "mA",
			"legacyLabel": "Anode current (mA)"
		},
		{
			"path": "gain",
			"label": "Driver gain",
			"unit": "V/V",
			"legacyLabel": "Gain"
		},
		{
			"path": "followerOperatingPoint.anodeVoltage",
			"label": "Follower voltage",
			"unit": "V",
			"legacyLabel": "Follower voltage (V)"
		},
		{
			"path": "followerOperatingPoint.anodeCurrent",
			"label": "Follower current",
			"unit": "mA",
			"legacyLabel": "Follower current(mA)"
		}
	],
	series: [
		{
			"point": "operatingPoint",
			"color": "rgba(0, 255, 0, 1)",
			"label": "V1 operating point",
			"legendLabel": "V1 operating point"
		},
		{
			"curve": "anodeLoadLine",
			"color": "rgba(0, 127, 0, 1)",
			"label": "Anode load line",
			"legendLabel": "Anode load line"
		},
		{
			"point": "followerOperatingPoint",
			"color": "rgba(0, 255, 255, 1)",
			"label": "V2 operating point",
			"legendLabel": "V2 operating point"
		},
		{
			"curve": "followerLoadLine",
			"color": "rgba(0, 191, 191, 1)",
			"label": "Follower load line",
			"legendLabel": "Follower load line"
		},
		{
			"curve": "cathodeLoadLine",
			"color": "rgba(0, 0, 127, 1)",
			"label": "Cathode load line",
			"legendLabel": "Cathode load line"
		}
	],
	help: [
		"For guitarists, the DC Cathode Follower is a very specific beast that is designed to introduce distortion (it is worth consulting the Valve Wizard for a complete explanation). When biased correctly, the stage introduces soft clipping to just one half of the signal swing. This leads to a distortion that contains mainly even harmonics - which are harmonically related (in musical terms) to the fundamental and so sound more musical than harsh odd harmonics.",
		"The key to making this stage work is to set the follower load such that the follower is biased very hot - this actually causes the grid of the follower to start stealing current from the anode of the amplifier with higher signal levels. This is hard to achieve with devices designed to deliver plenty of anode current (e.g. the 12AU7) but works well with tubes that are less well suited to operation as a follower, and the \"classic\" circuit always uses a 12AX7 (although I have used this circuit effectively with a 6SL7).",
		"This circuit tends to set the cathode voltage of the follower (i.e., the anode voltage of the amplifier) quite high, so care needs to be taken with regard to heater cathode voltage limits and heater elevation is likely to be needed to stay within safe limits. Also note the Valve Wizard's advice regarding additional components to protect the follower during start up, and the effect of using a grid stopper."
	]
});
designerCircuitDefinitions.push({
	id: 'singleended',
	title: "Single-ended output",
	category: "Power stage",
	summary: "Set anode bias current and transformer load for a single-ended output stage.",
	devices: () => powerPentodes.concat(powerTriodes),
	calculate: (device, parameters) => calculateOutputStage(device, parameters),
	schematic: 'singleended.png',
	schematicAlt: "Single-ended output circuit schematic, with component labels matching the inputs.",
	resultsHeading: "Bias & output",
	resultNote: "The single-ended output power calculation is known to be inaccurate.",
	parameters: [
		{
			"key": "supplyVoltage",
			"label": "Supply voltage",
			"symbol": "B+",
			"unit": "V",
			"scale": 1,
			"defaultValue": 300,
			"legacyLabel": "Supply voltage"
		},
		{
			"key": "screenVoltage",
			"label": "Screen voltage",
			"symbol": "Vg2",
			"unit": "V",
			"scale": 1,
			"defaultValue": 250,
			"legacyLabel": "Screen voltage"
		},
		{
			"key": "anodeBiasCurrent",
			"label": "Anode bias current",
			"symbol": "Ia",
			"unit": "mA",
			"scale": 1,
			"defaultValue": 30,
			"legacyLabel": "Bias current (anode)"
		},
		{
			"key": "loadResistance",
			"label": "Anode load",
			"symbol": "Ra",
			"unit": "kΩ",
			"scale": 1000,
			"defaultValue": 8000,
			"legacyLabel": "Anode load"
		}
	],
	outputs: [
		{
			"path": "operatingPoint.biasVoltage",
			"label": "Bias magnitude",
			"unit": "V",
			"legacyLabel": "Bias point (V)"
		},
		{
			"path": "operatingPoint.cathodeCurrent",
			"label": "Cathode current",
			"unit": "mA",
			"legacyLabel": "Cathode current (mA)"
		},
		{
			"path": "cathodeResistance",
			"label": "Cathode resistor",
			"unit": "Ω",
			"legacyLabel": "Cathode resistor (ohms)"
		},
		{
			"path": "outputPower",
			"label": "Output power estimate",
			"unit": "W",
			"legacyLabel": "Max output power (W)"
		}
	],
	series: [
		{
			"point": "operatingPoint",
			"color": "rgba(0, 255, 0, 1)",
			"label": "Operating point",
			"legendLabel": "Operating point"
		},
		{
			"curve": "acLoadLine",
			"color": "rgba(0, 127, 0, 1)",
			"label": "AC load line",
			"legendLabel": "AC load line"
		}
	],
	help: [
		"The Single Ended Output Stage is the simplest amplifier output stage and necessarily operates in pure Class A (thus avoiding any possible crossover distortion), but these benefits come at a cost of efficiency and output power. Furthermore, for pentodes, the lack of linearity as the valve approaches cut off introduces more distortion (less good for HiFi but potentially great for guitar).",
		"The only real difference from the push pull output stage from a design standpoint is that the single ended architecture can only operate in Class A as there is no second tube to take over once tube is cut off. This means that a) the output power is much lower (without gross distortion), and b) that the warmer you bias, the greater the available Class A swing will be.",
		"NB: The output power calculation is not currently correct"
	]
});
designerCircuitDefinitions.push({
	id: 'singleended-ul',
	title: "Ultralinear single-ended",
	category: "Power stage",
	summary: "Explore a single-ended output stage with a tapped screen connection.",
	devices: () => powerPentodes,
	calculate: (device, parameters) => calculateOutputStage(device, parameters, {ultralinear: true}),
	schematic: 'singleended-ul.png',
	schematicAlt: "Ultralinear single-ended circuit schematic, with component labels matching the inputs.",
	resultsHeading: "Bias & output",
	resultNote: "The single-ended output power calculation is known to be inaccurate.",
	parameters: [
		{
			"key": "supplyVoltage",
			"label": "Supply voltage",
			"symbol": "B+",
			"unit": "V",
			"scale": 1,
			"defaultValue": 300,
			"legacyLabel": "Supply voltage"
		},
		{
			"key": "screenTap",
			"label": "Screen tap",
			"symbol": "UL",
			"unit": "%",
			"scale": 0.01,
			"defaultValue": 0.5,
			"legacyLabel": "Screen tap",
			"min": 0,
			"includeMin": true,
			"max": 100
		},
		{
			"key": "anodeBiasCurrent",
			"label": "Anode bias current",
			"symbol": "Ia",
			"unit": "mA",
			"scale": 1,
			"defaultValue": 30,
			"legacyLabel": "Bias current (anode)"
		},
		{
			"key": "loadResistance",
			"label": "Anode load",
			"symbol": "Ra",
			"unit": "kΩ",
			"scale": 1000,
			"defaultValue": 8000,
			"legacyLabel": "Anode load"
		}
	],
	outputs: [
		{
			"path": "operatingPoint.biasVoltage",
			"label": "Bias magnitude",
			"unit": "V",
			"legacyLabel": "Bias point (V)"
		},
		{
			"path": "operatingPoint.cathodeCurrent",
			"label": "Cathode current",
			"unit": "mA",
			"legacyLabel": "Cathode current (mA)"
		},
		{
			"path": "cathodeResistance",
			"label": "Cathode resistor",
			"unit": "Ω",
			"legacyLabel": "Cathode resistor (ohms)"
		},
		{
			"path": "outputPower",
			"label": "Output power estimate",
			"unit": "W",
			"legacyLabel": "Max output power (W)"
		}
	],
	series: [
		{
			"point": "operatingPoint",
			"color": "rgba(0, 255, 0, 1)",
			"label": "Operating point",
			"legendLabel": "Operating point"
		},
		{
			"curve": "acLoadLine",
			"color": "rgba(0, 127, 0, 1)",
			"label": "AC load line",
			"legendLabel": "AC load line"
		}
	],
	help: [
		"The Ultralinear Single Ended Output Stage is (as the name suggests), a way of improving the linearity and lowering the distortion of a pentode output stage. It does this by biasing a pentode so that its characteristics are somewhere between a pentode and a triode. In general this is more likely to be applicable to HiFi amplifiers and is likely to be a requirement for single ended pentode HiFi amplifiers due to the inherent non-linearity of these tubes as they approach cut off.",
		"NB: The output power calculation is not currently correct"
	]
});
designerCircuitDefinitions.push({
	id: 'pushpull',
	title: "Push-pull output",
	category: "Power stage",
	summary: "Explore the bias and transformer load of a push-pull output pair.",
	devices: () => powerPentodes.concat(powerTriodes),
	calculate: (device, parameters) => calculateOutputStage(device, parameters, {pushPull: true}),
	schematic: 'pushpull.png',
	schematicAlt: "Push-pull output circuit schematic, with component labels matching the inputs.",
	resultsHeading: "Bias & output",
	resultNote: "Cathode current is per valve. The calculated cathode resistor is shared by both valves.",
	parameters: [
		{
			"key": "supplyVoltage",
			"label": "Supply voltage",
			"symbol": "B+",
			"unit": "V",
			"scale": 1,
			"defaultValue": 300,
			"legacyLabel": "Supply voltage"
		},
		{
			"key": "screenVoltage",
			"label": "Screen voltage",
			"symbol": "Vg2",
			"unit": "V",
			"scale": 1,
			"defaultValue": 250,
			"legacyLabel": "Screen voltage"
		},
		{
			"key": "anodeBiasCurrent",
			"label": "Anode bias current",
			"symbol": "Ia",
			"unit": "mA",
			"scale": 1,
			"defaultValue": 30,
			"legacyLabel": "Bias current (anode)"
		},
		{
			"key": "loadResistance",
			"label": "Anode-to-anode load",
			"symbol": "Raa",
			"unit": "kΩ",
			"scale": 1000,
			"defaultValue": 8000,
			"legacyLabel": "Anode to anode load"
		}
	],
	outputs: [
		{
			"path": "operatingPoint.biasVoltage",
			"label": "Bias magnitude",
			"unit": "V",
			"legacyLabel": "Bias point (V)"
		},
		{
			"path": "operatingPoint.cathodeCurrent",
			"label": "Cathode current / valve",
			"unit": "mA",
			"legacyLabel": "Cathode current (mA)"
		},
		{
			"path": "cathodeResistance",
			"label": "Shared cathode resistor",
			"unit": "Ω",
			"legacyLabel": "Cathode resistor (ohms)"
		},
		{
			"path": "outputPower",
			"label": "Output power estimate",
			"unit": "W",
			"legacyLabel": "Max output power (W)"
		}
	],
	series: [
		{
			"point": "operatingPoint",
			"color": "rgba(0, 255, 0, 1)",
			"label": "Operating point",
			"legendLabel": "Operating point"
		},
		{
			"curve": "acLoadLine",
			"color": "rgba(0, 127, 0, 1)",
			"label": "AC load line",
			"legendLabel": "AC load line"
		}
	],
	help: [
		"The Push Pull Output Stage is the most efficient way of driving a speaker as it typically operates in Class AB and this makes it easier to deliver higher output powers if being loud is what you're after. In guitar amplifiers this circuit is almost always built with pentodes or beam tetrodes but triodes (or triode-strapped pentodes) are more commonly found in HiFi amplifiers as this typically yields greater linearity.",
		"Output stages, particularly the push pull flavour, may seem complex from a design perspective but they are deceptively simple. The DC load line is vertical because there is no resistive load. This means that the quiescent current is simply set by the bias voltage - this can either be achieved by applying a negative bias voltage to the bottom of the grid leak resistors, or by using a cathode resistor (bypassed) to provide cathode bias. For simplicity, this design calculator allows you to set the desired quiescent anode current, from which the bias voltage can be determined and, in turn, the value of the required cathode resistor (remembering that the cathode resistor is common to both valves and so will carry twice the quiescent cathode current of each valve) is also shown in case cathode bias is desired (cathode bias tends to provide some compression, while fixed bias creates more \"bark\").",
		"NB: For biasing, you select the desired anode current as it is this that determines the anode power dissipation at the supply voltage. However, when adjusting fixed bias amplifiers it is the cathode current that is typically measured, either by measuring the voltage across a 1 ohm cathode resistor or by using an adapter connected to an ammeter.",
		"The AC load line allows us to understand the output swing and power and is determined by the characteristics of the output transformer, specifically the anode to anode impedance (Raa). When the valves are operating in Class A (both tubes conducting), both valves see the whole primary but, as they are out of phase, each valve sees half the total load impedance. When one of the valves is cut off, the other tube only sees its half of the primary and, because the impedance ratio of a transformer is the square of the turns ratio, this means that the \"on\" tube now sees just a quarter of the total load impedance. The Class B load line (with a slope of one quarter Raa) is simply drawn in the usual way, and the Class A load line is drawn through the bias point with a slope of one half Raa. The AC load line simply transitions from the Class A load line to the Class B load line where the two load lines cross. In practice, the transition from Class A to Class B is not abrupt, so there is a blend that occurs across the transition.",
		"So far, we have not had to consider the characteristics of the valve at all! The primary thing we really need to care about with regard to the valve is whether or not the bias conditions will cause it to fail and, for this, the only thing we need to know is the anode power dissipation. As long as the bias point is below the anode power limit and the AC load line does not significantly encroach above the power curve then we should be fine (you can get away with a bit of encroachment in a guitar amplifier as the average power dissipation will be well below this).",
		"At this point, the final step we need to consider for pentodes is where to set the screen voltage. For maximimum efficiency we want the AC load line to pass through the \"knee\" of the anode curves, for minimum distortion we want the load line to pass above the knee, and for maximum power and \"colour\" we want the load line to pass below the knee. In the last case, the one thing to bear in mind is that at maximum signal, significant screen grid current will start to flow such that the screen grid power limit will come into play. Once the desired screen grid voltage has been determined then it is typically created using a resistive dropper in the power supply (with a suitable reservoir capacitor) - the voltage dropped across this resistor will be determined by the quiescent screen current and preamp current."
	]
});
designerCircuitDefinitions.push({
	id: 'pushpull-ul',
	title: "Ultralinear push-pull",
	category: "Power stage",
	summary: "Explore a push-pull output pair with ultralinear screen taps.",
	devices: () => powerPentodes,
	calculate: (device, parameters) => calculateOutputStage(device, parameters, {pushPull: true, ultralinear: true}),
	schematic: 'pushpull-ul.png',
	schematicAlt: "Ultralinear push-pull circuit schematic, with component labels matching the inputs.",
	resultsHeading: "Bias & output",
	resultNote: "Cathode current is per valve. The calculated cathode resistor is shared by both valves.",
	parameters: [
		{
			"key": "supplyVoltage",
			"label": "Supply voltage",
			"symbol": "B+",
			"unit": "V",
			"scale": 1,
			"defaultValue": 300,
			"legacyLabel": "Supply voltage"
		},
		{
			"key": "screenTap",
			"label": "Screen tap",
			"symbol": "UL",
			"unit": "%",
			"scale": 0.01,
			"defaultValue": 0.3,
			"legacyLabel": "Screen tap",
			"min": 0,
			"includeMin": true,
			"max": 100
		},
		{
			"key": "anodeBiasCurrent",
			"label": "Anode bias current",
			"symbol": "Ia",
			"unit": "mA",
			"scale": 1,
			"defaultValue": 30,
			"legacyLabel": "Bias current (anode)"
		},
		{
			"key": "loadResistance",
			"label": "Anode-to-anode load",
			"symbol": "Raa",
			"unit": "kΩ",
			"scale": 1000,
			"defaultValue": 8000,
			"legacyLabel": "Anode to anode load"
		}
	],
	outputs: [
		{
			"path": "operatingPoint.biasVoltage",
			"label": "Bias magnitude",
			"unit": "V",
			"legacyLabel": "Bias point (V)"
		},
		{
			"path": "operatingPoint.cathodeCurrent",
			"label": "Cathode current / valve",
			"unit": "mA",
			"legacyLabel": "Cathode current (mA)"
		},
		{
			"path": "cathodeResistance",
			"label": "Shared cathode resistor",
			"unit": "Ω",
			"legacyLabel": "Cathode resistor (ohms)"
		},
		{
			"path": "outputPower",
			"label": "Output power estimate",
			"unit": "W",
			"legacyLabel": "Max output power (W)"
		}
	],
	series: [
		{
			"point": "operatingPoint",
			"color": "rgba(0, 255, 0, 1)",
			"label": "Operating point",
			"legendLabel": "Operating point"
		},
		{
			"curve": "acLoadLine",
			"color": "rgba(0, 127, 0, 1)",
			"label": "AC load line",
			"legendLabel": "AC load line"
		}
	],
	help: [
		"Ultralinear output stages involve connecting the screen of an output pentode to a tap on the primary of the output transformer. What this means is that the screen voltage is always a fixed percentage between the rail and the anode. With the tap set at 100%, the screen is connected to the anode, i.e. the valve will be \"triode-strapped\" while, at the opposite extreme, the screen is simply permanently connected to the supply voltage. A tap somewhere in the middle leads to characteristic curves that are somewhere between a pentode and a triode. This is useful for HiFi amplifiers because it preserves most of the output swing of the pentode while conferring some of the limearity of a triode.",
		"Note that there isn't a separate design calculator for triode-strapped pentodes as this calculator achieves that with a tap value of 1.0"
	]
});

const designerCalculatorLinks = designerCircuitDefinitions.map(definition => ({
	id: definition.id, title: definition.title, category: definition.category, description: definition.summary, href: '#' + definition.id
}));
