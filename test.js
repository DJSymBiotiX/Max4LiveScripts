/* Define a nice logging function that
 * should log whatever we give it
 */
function log () {
	for (var i = 0; i < arguments.length; i++) {
		var message = arguments[i];

		if (message && message.toString) {
			var s = message.toString();

			if (s.indexOf("[object ") >= 0) {
				s = JSON.stringify(message);
			}
			post (s);
		} else if (message === null) {
			post ("<null>");
		} else {
			post (message);
		}
	}
	post ("\n");
}

// Show where we reloaded the script in the log file
log("__________________________________________________________");
log("Reload: ", new Date);


// Set the amount of inlets and outlets that we want
/*
 * Inlets:
 *  0: Note In
 *  1: Key Signature [C, D, E, F, G, A, B]
 *  2: Major/Minor [Major, Minor]
 *  3-8: C, D, E, F, G, A, B
 */
inlets = 9;

/*
 * Outlets:
 * 0-4: Notes 1 to 5
 */
outlets = 5;

// Set our objects/arrays for the settings

var keys = ["C", "D", "E", "F", "G", "A", "B"];
var key_signature = 0;

var majmin = ["Major", "Minor"];
var mode = 0;

var chords = [
	[
		["Triad", "Seventh", "Add2", "Add4", "Add6", "Add9", "Sus2", "Sus4", "Maj7sys2", "Maj7sus4"]
	]
];
var c_key = 0;

var note_values = [
	[0, 12, 24, 36, 48, 60, 72, 84, 96, 108, 120]
];

function contains (a, obj) {
	for (var i = 0; i < a.length; i++) {
		if (a[i] === obj) {
			return true;
		}
	}
	return false;
};

function three_chord(note, a, b, c) {
	outlet(0, note + a);
	outlet(1, note + b);
	outlet(2, note + c);
};

function four_chord(note, a, b, c, d) {
	outlet(0, note + a);
	outlet(1, note + b);
	outlet(2, note + c);
	outlet(3, note + d);
};

function play_note (note) {
	// Detect Note
	// C
	log (note);
	log (note_values[0]);
	if (contains(note_values[0], note)) {
		switch(c_key) {
			case 0: //Triad
				three_chord(note, 0, 4, 7);
				break;
			case 1: //Seventh
				four_chord(note, 0, 4, 7, 11);
				break;
		}
	}
}

function msg_float(f) {
	msg_int(f);
}

function msg_int(i) {
	log(inlet, ': ', i);

	switch (inlet) {
		case 0:
			log ("Play Note");
			play_note(i);
			break;
		case 1: // Key Signature
			key_signature = i;
			log ("Key Signature: ", keys[key_signature]);
			break;
		case 2: // Mode [Major, Minor]
			mode = i;
			log ("Mode: ", majmin[mode]);
			break;
		case 3: // C Key
			c_key = i;
			break;
	}
}
