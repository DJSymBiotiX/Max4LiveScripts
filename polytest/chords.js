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
// list voice, pitch, velocity
outlets = 1;


// Accept a note in trigger.
// Will trigger when a midi note is played
var notein = function (voice, pitch, velocity) {
log("notein: [", voice, ' : ', pitch, ' : ', velocity, "]");
outlet(0, [voice, pitch, velocity]);
outlet(0, [voice, pitch + 4, velocity]);
outlet(0, [voice, pitch + 7, velocity]);
};

// Accept a note mod trigger
// Will trigger when one of the note knobs is changed
var notemod = function () {
log("notemod: ", arguments);

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
