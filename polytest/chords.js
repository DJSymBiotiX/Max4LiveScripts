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

// Input
// notein list/function
// notemod list/function
inlets = 2;

// Output
// list pitch, velocity
outlets = 1;

// Variables
var key_selectors = {
    C: 0, // Triad Seventh Add2 Add4 Add6 Add9 Sus2 Sus4 Maj7sus2 Maj7sus4
    D: 0, // Triad Seventh Add2 Add4 Add6 Add9 9 Sus2 Sus4 7sus2 7sus4
    E: 0, // Triad Seventh Add4 Sus4 7sus4
    F: 0, // Triad Seventh Add2 Add6 Add9 Sus2 Maj7sus2
    G: 0, // Triad Seventh Add2 Add4 Add6 Add9 9 Sus2 Sus4 7Sus2 7Sus4
    A: 0, // Triad Seventh Add2 Add4 Add9 9 Sus2 Sus4 7sus2 7sus4
    B: 0  // Triad Seventh
};

// Chords -> Key Played -> Chord
var chords = {
    C: [
        [0, 4, 7],      // Triad
        [0, 4, 7, 11],  // Seventh
        [0, 2, 4, 7],   // Add2
        [0, 4, 5, 7],   // Add4
        [0, 4, 7, 9],   // Add6
        [0, 4, 7, 14],  // Add9
        [0, 2, 7],      // Sus2
        [0, 5, 7],      // Sus4
        [0, 2, 7, 11],  // Maj7sus2
        [0, 5, 7, 11]   // Maj7sus4
    ],
    D: [
        [0, 3, 7],      // Triad
        [0, 3, 7, 10],  // Seventh
    ],
    E: [
        [0, 3, 7],      // Triad
    ],
    F: [
        [0, 4, 7],      // Triad
    ],
    G: [
        [0, 4, 7],      // Triad
    ],
    A: [
        [0, 3, 7],      // Triad
    ],
    B: [
        [0, 3, 6],      // Triad
        [0, 3, 6, 10]   // Seventh
    ]
};

var keys_on = {};

var determine_chord = function (pitch, velocity) {
    var key_played = get_key_played(pitch);

    // Don't play anything if the key isnt in the key selectors
    if (contains(key_selectors, key_played)) {
        play_chord(pitch, velocity, chords[key_played][key_selector[key_played]]);
    }
};

// Take in a note, velocity, and offsets and play the chord
var play_chord = function (pitch, velocity, offsets) {
    for (var i in offsets) {
        // Get offset
        var offset = offsets[i];

        // Get the key name and octave of the key we want to play
        var key_value = get_key_played(pitch + offset);
        var octave = get_octave_played(pitch + offset);
        var key = key_value + "" + octave;

        // If this is a note on message (velocity != 0)
        if (velocity != 0) {
            // If the note is already on...
            if (contains(key_on, key)) {
                // Send a note off trigger for that note
                outlet(0, [pitch + offset, 0]);
                delete key_on[key];
            }
            // Send a note on trigger for that note
            outlet(0, [pitch + offset, velocity]);
            key_on[key] = true;
        } else {
            // velocity == 0
            if (contains(key_on, key)) {
                // If the key is still "on" delete it from the key_on
                // dict. This sets it to actually be turned off
                // on a subsequent note off message
                delete key_on[key];
            } else {
                // Key doesn't exist in the key_on dict,
                // lets send a proper note off for it
                outlet(0, [pitch + offset, 0]);
            }
        }
    }
};

var get_key_played = function (pitch) {
    var all_keys = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    for (var i in all_keys) {
        if (pitch % 12 == i) {
            return all_keys[i];
        }
    }
    return -1;
};

var get_octave_played = function (pitch) {
    return pitch / 12;
};

// Accept a note in trigger.
// Will trigger when a midi note is played
var notein = function (pitch, velocity) {
    log("notein: [", pitch, ' : ', velocity, "]");
    determine_chord(pitch, velocity);
};

// Accept a note mod trigger
// Will trigger when one of the note knobs is changed
var notemod = function (c, d, e, f, g, a, b) {
    var selectors = {C: c, D: d, E: e, F: f, G: g, A: a, B: b};
    log("notemod: ", selectors);
    key_selectors = selectors;
};

// Don't Need These [Just in case tho]

var msg_int = function (i) {
    log("msg_int: [", inlet, " : ", i, "]");
};

var msg_float = function (f) {
    log("msg_float: [", inlet, " : ", f, "]");
};

var list = function (l) {
    log("list: [", inlet, " : ", l, "]");
};

var bang = function () {
    log("bang");
};

var anything = function (a) {
    log("anything: [", inlet, " : ", a, "]");
};
