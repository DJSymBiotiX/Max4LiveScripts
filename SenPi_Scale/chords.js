var log_mode = {
	info: 1,
	debug: 2,
	verbose: 3
};
var verbosity = log_mode.info;
var loger = function (msg) {
	if (msg && msg.toString) {
		var s = msg.toString();
		if (s.indexOf("[object ") >= 0) {
			s = JSON.stringify(msg);
		}
		post(s);
	} else if (msg === null) {
		post("<null>");
	} else {
		post(msg);
	}
};

var log = {
	info: function () {
		if (verbosity >= log_mode.info) {
			loger("[I] ");
			for (var i in arguments) {
				loger(arguments[i]);
			}
			post('\n');
		}
	},
	debug: function () {
		if (verbosity >= log_mode.debug) {
			loger("[D] ");
			for (var i in arguments) {
				loger(arguments[i]);
			}
			post('\n');
		}
	},
	verbose: function () {
		if (verbosity >= log_mode.verbose) {
			loger("[V] ");
			for (var i in arguments) {
				loger(arguments[i]);
			}
			post('\n');
		}
	}
};

// Show where we reloaded the script in the log
log.info("__________________________________________________________");
log.info("Reload: ", new Date);

// Input
// notein list/function
// notemod list/function
// log level
inlets = 3;

// Output
// list pitch, velocity
outlets = 1;

// Variables
var all_keys = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
var key_selectors = {
	C: 0,
	D: 0,
	E: 0,
	F: 0,
	G: 0,
	A: 0,
	B: 0
};

// Chords -> Key Played -> Chord
var chords = {
	C: [
		[0, 4, 7],					// Triad
		[0, 4, 7, 11],			// Seventh
		[0, 2, 4, 7],				// Add2
		[0, 4, 5, 7],				// Add4
		[0, 4, 7, 9],				// Add6
		[0, 4, 7, 14],			// Add9
		[0, 2, 7],					// Sus2
		[0, 5, 7],					// Sus4
		[0, 2, 7, 11],			// Maj7sus2
		[0, 5, 7, 11]				// Maj7sus4
	],
	D: [
		[0, 3, 7],					// Triad
		[0, 3, 7, 10],			// Seventh
		[0, 2, 3, 7],				// Add2
		[0, 3, 5, 7],				// Add4
		[0, 3, 7, 9],				// Add6
		[0, 3, 7, 14],			// Add9
		[0, 3, 7, 10, 14],	// 9
		[0, 2, 7],					// Sus2
		[0, 5, 7],					// Sus4
		[0, 2, 7, 10],			// 7sus2
		[0, 5, 7, 10]				// 7sus4
	],
	E: [
		[0, 3, 7],					// Triad
		[0, 3, 7, 10],			// Seventh
		[0, 3, 5, 7],				// Add4
		[0, 5, 7],					// Sus4
		[0, 5, 7, 10]				// 7sus4
	],
	F: [
		[0, 4, 7],					// Triad
		[0, 4, 7, 11],			// Seventh
		[0, 2, 4, 7],				// Add2
		[0, 4, 7, 9],				// Add6
		[0, 4, 7, 14],			// Add9
		[0, 2, 7,],					// Sus2
		[0, 2, 7, 11]				// Maj7sus2
	],
	G: [
		[0, 4, 7],					// Triad
		[0, 4, 7, 10],			// Seventh
		[0, 2, 4, 7],				// Add2
		[0, 4, 5, 7],				// Add4
		[0, 4, 7, 9],				// Add6
		[0, 4, 7, 14],			// Add9
		[0, 4, 7, 10, 14],	// 9
		[0, 2, 7],					// Sus2
		[0, 5, 7],					// Sus4
		[0, 2, 7, 10],			// 7sus2
		[0, 5, 7, 10]				// 7sus4
	],
	A: [
		[0, 3, 7],					// Triad
		[0, 3, 7, 10],			// Seventh
		[0, 2, 3, 7],				// Add2
		[0, 3, 5, 7],				// Add4
		[0, 3, 7, 14],			// Add9
		[0, 3, 7, 10, 14],	// 9
		[0, 2, 7],					// Sus2
		[0, 5, 7],					// Sus4
		[0, 2, 7, 10],			// 7sus2
		[0, 5, 7, 10]				// 7sus4
	],
	B: [
		[0, 3, 6],					// Triad
		[0, 3, 6, 10]				// Seventh
	]
};

// Key state management
var keys_on = {};
var input_keys = {};

var play_chord = function (key_letter, midi_note, velocity) {
	var offsets = chords[key_letter][key_selectors[key_letter]];

	// Loop through the offsets and go through
	// the chord logic
	for (var i in offsets) {
		var play_note = midi_note + offsets[i];
		var key = value_to_key(play_note);
		var in_keys_on = (key in keys_on);

		// If this is a note on message...
		if (velocity != 0) {
			// Send a note off before the note on,
			// if the note is currently already on
			if (in_keys_on) {
				note_off(play_note);
			}

			// Send a note on
			note_on(play_note, velocity);

			// Deal with key state by adding the key
			// to the state tracker, or incrementing
			// its count
			if (!in_keys_on) {
				keys_on[key] = 1;
			} else {
				keys_on[key] += 1;
			}
		} else { // This is a note off message (velocity = 0)
			if (in_keys_on) {
				// If the key is still "on" decrement it
				// from the keys_on dict.
				keys_on[key] -= 1;
			}
		}

		// If the key is in keys_on and is set to 0
		// then send  note_off message for it and
		// delete it from the keys_on dict
		if (in_keys_on && keys_on[key] == 0) {
			note_off(play_note);
			delete keys_on[key];
		}
	}
};

/* Accept a note in trigger.
 * Will trigger when a midi note is played
 */
var notein = function (midi_note, velocity) {
	log.debug("notein ", midi_note, ' ', velocity);

	// Keep a state of which keys are currently being held down
	if (velocity != 0) {
		input_keys[value_to_key(midi_note)] = true;
	} else {
		delete input_keys[value_to_key(midi_note)];
	}

	// Determine the chord to play and play it
	var key_letter = get_key_letter(midi_note);
	if (key_letter in key_selectors) {
		play_chord(key_letter, midi_note, velocity);
	}

	// Clean up the stuck keys if we need to
	clean_up_keys();
};

/* Accept a note mod trigger
 * Will trigger when one of
 * the note knobs is changed
 * or when a midi note is played
 */
var notemod = function (c, d, e, f, g, a, b) {
	var selectors = {C: c, D: d, E: e, F: f, G: g, A: a, B: b};
	key_selectors = selectors;

	// Clean up the stuck keys if we need to
	clean_up_keys();

	log.debug("notemod ", selectors);
};

var loglevel = function (log_level) {
	verbosity = log_level;
	log.debug("loglevel ", log_level);
};

/* Return the key letter
 * for the key that the midi note represents
 */
var get_key_letter = function (midi_note) {
	return all_keys[midi_note % 12];
};

/* Return the key octave number
 * for the key that the midi note represents
 */
var get_octave_number = function (midi_note) {
    return parseInt(midi_note / 12, 10);
};

/* Convert a key/octave (A5)
 * to a midi key value (69) representation
 */
var key_to_value = function (key) {
	var letter, octave, value;

	// If there is a sharp in the key, the indexes will be different
	if (key.indexOf("#") != -1) {
		letter = key.charAt(0) + key.charAt(1);
		octave = parseInt(key.charAt(2), 10);
	} else {
		letter = key.charAt(0);
		octave = parseInt(key.charAt(1), 10);
	}

	value = all_keys.indexOf(letter) + (12 * octave);

	log.verbose("K2V ", key, " -> ", value);
	return value;
};

/* Convert a midi key value (69)
 * to a key/octave (A5) representation
 */
var value_to_key = function (value) {
	var key = get_key_letter(value) + "" + get_octave_number(value);
	log.verbose("V2K ", value, " -> ", key);
	return key;
};

/* Send a note on message to the outlet,
 * using the midi key value and velocity
 */
var note_on = function (key_value, velocity) {
	log.verbose("Note On ", key_value, " ", velocity);
	outlet(0, [key_value, velocity]);
};

/* Send a note off message to the outlet,
 * using the midi key value and implicit velocity 0
 */
var note_off = function (key_value) {
	log.verbose("Note Off ", key_value);
	outlet(0, [key_value, 0]);
};

/* Clean Up Keys
 * If we have any chord keys stuck and
 * no keys are currently being held down
 * then send note off's for all the stuck keys
 * and clean up the key state variables
 */
var clean_up_keys = function () {
	log.verbose("Clean Up Keys");
	// If we have no active notein keys, but we have some stuck chord keys...
	if (obj_length(input_keys) == 0 && obj_length(keys_on) > 0) {
		// Send note offs for each stuck note
		var del = [];
		for (var i in keys_on) {
			// Get the midi value and send a note_off
			var value = key_to_value(i);
			note_off(value);

			// Save the key to delete outside of this loop
			del.push(i);
		}

		// Delete any values from keys_on
		for (var i in del) {
			delete keys_on[del[i]];
		}
	}
};

/* Take in any object/dictionary
 * and return the number of keys it
 * posesses
 */
var obj_length = function (obj) {
	return Object.keys(obj).length;
};
