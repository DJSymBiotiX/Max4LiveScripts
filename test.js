/* Define a nice logging function that
 * should log whatever we give it
 */
let log = function () {
    for (let i in arguments) {
        msg = arguments[i];
        if (msg && msg.toString) {
            let s = message.toString();
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
let contains = function (a, obj) {
    return a.indexOf(obj) != -1;
};

// Show where we reloaded the script in the log file
log("__________________________________________________________");
log("Reload: ", new Date);


/* Play a Chord
 * Take in a note and a set of offsets as an array
 */
let play_chord = function (note, offsets) {
	for (let i in offsets) {
        offset = offsets[i];
        outlet(i, note + offset);
    }
};


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

let all_keys = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
let key_signature = "C";

let majmin = ["Major", "Minor"];
let mode = "Major";

// Chords -> Key Signature -> Key Played -> Mode -> Chord
let chords = {
    C: {
        C: {
            Major: [
                [0, 4, 7],
                [0, 4, 7, 11]
            ],
            Minor: [

            ]
        }
    }
};

//["Triad", "Seventh", "Add2", "Add4", "Add6", "Add9", "Sus2", "Sus4", "Maj7sys2", "Maj7sus4"]
let c_key = 0;


// Determine the key that was played
let get_key_played = function (note) {
    let notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

    for (let i in notes) {
        if (note == i || note % 12 == i) {
            return notes[i];
        }
    }
    return -1;
};

let play_note = function (note) {
    let key_played = get_key_played(note);
    play_chord(note, chords[key_signature][key_played][mode][c_key]);
};

let msg_float = function (f) {
	log("Message Float: ", f);
}

let msg_int = function (i) {
	log("Message Int: [", inlet, " : ", i, "]");

	switch (inlet) {
		case 0: // Note In
			play_note(i);
			break;
		case 1: // Key Signature
			key_signature = all_keys[i];
			log ("Key Signature: ", key_signature);
			break;
		case 2: // Mode [Major, Minor]
			mode = majmin[i];
			log ("Mode: ", mode);
			break;
		case 3: // C Key
			c_key = i;
			break;
	}
}
