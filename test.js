/* Define a nice logging function that
 * should log whatever we give it
 */
var log = function () {
    for (var i in arguments) {
        msg = arguments[i];
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
    }
    post("\n");
};

// Quickhand to see if an object exists in an array
var contains = function (a, obj) {
    return a.indexOf(obj) != -1;
};

// Show where we reloaded the script in the log file
log("__________________________________________________________");
log("Reload: ", new Date);


/* Play a Chord
 * Take in a note and a set of offsets as an array
 */
var play_chord = function (note, offsets) {
	for (var i in offsets) {
		offset = offsets[i];
		
		// Gotta do this because outlet doesn't seem to support
		// using a variable for the first argument
		switch (i) {
			case "0":
 				outlet(0, note + offset);
				break;
			case "1":
				outlet(1, note + offset);
				break;
			case "2":
				outlet(2, note + offset);
				break;
			case "3":
				outlet(3, note + offset);
				break;
			case "4":
				outlet(4, note + offset);
				break;
		}
    }
};


/*
 * Inlets:
 *  0: Note In
 *  1-7: C, D, E, F, G, A, B
 */
inlets = 8;

/*
 * Outlets:
 * 0-4: Notes 1 to 5
 */
outlets = 5;

// Chords -> Key Signature -> Key Played -> Mode -> Chord
var chords = {
	C: [
		[0, 4, 7],		// Triad
		[0, 4, 7, 11],	// Seventh
	],
	D: [
		[0, 3, 7],		// Triad
		[0, 3, 7, 10],  // Seventh
	],
	E: [
		[0, 3, 7],		// Triad
	],
	F: [
		[0, 4, 7],		// Triad
	],
	G: [
		[0, 4, 7],		// Triad
	],
	A: [
		[0, 3, 7],		// Triad
	],
	B: [
		[0, 3, 6],		// Triad
	]
};

var key_selectors = ["C", "D", "E", "F", "G", "A", "B"];
var keys = {
	C: 0, // Triad Seventh Add2 Add4 Add6 Add9 Sus2 Sus4 Maj7sus2 Maj7sus4
	D: 0, // Triad Seventh Add2 Add4 Add6 Add9 9 Sus2 Sus4 7sus2 7sus4
	E: 0, // Triad Seventh Add4 Sus4 7sus4
	F: 0, // Triad Seventh Add2 Add6 Add9 Sus2 Maj7sus2
	G: 0, // Triad Seventh Add2 Add4 Add6 Add9 9 Sus2 Sus4 7Sus2 7Sus4
	A: 0, // Triad Seventh Add2 Add4 Add9 9 Sus2 Sus4 7sus2 7sus4
	B: 0  // Triad Seventh
};


// Determine the key that was played
var get_key_played = function (note) {
	var all_keys = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    for (var i in all_keys) {
        if (note == i || note % 12 == i) {
            return all_keys[i];
        }
    }
    return -1;
};

var play_note = function (note) {
    var key_played = get_key_played(note);

	// Don't play anything if the key isn't in the key_selectors
	if (contains(key_selectors, key_played)) {
    	play_chord(note, chords[key_played][keys[key_played]]);
	}
};

var msg_float = function (f) {
	log("Message Float: ", f);
}

var msg_int = function (i) {
	log("Message Int: [", inlet, " : ", i, "]");

	if (inlet == 0) {
		// Note In
		play_note(i);
	} else {
		// Note Selectors
		keys[key_selectors[inlet - 1]] = i;
		log(keys);
		log(key_selectors);
		log(inlet - 1);
		log(key_selectors[inlet-1]);
	}
}
