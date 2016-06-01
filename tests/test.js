'use strict';

var test = require("unit.js"),
	morse = require("../lib/_morselib.js");

var converter = new morse.Converter(),
    machine,
//    five = require("johnny-five"),
//    board = new five.Board(),
    timeline = morse.timeline;

function translate(mes) {
    if (machine != null) {
        console.log("Check out your Arduino - it tells you:\n" + mes);
        machine.sendMessage(converter.engToMorse(mes));
        timeline.execute();
    } else
        console.log("Please wait a second, it seems like the board isn't ready yet!");
}

/* Test the Translation mechanism first */
describe("morse", function() {
	describe("Converter.engToMorse()", function() {
		it("should get valid values from the ABC", function() {
			var valid = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", " ", "\n", "\t"];
			// each one has an entry in the ABC
			valid.map(function(i) {
				test.assert.notEqual(converter.engToMorse(i), "");
				// should be equal to the entry in the ABC, because i is always one character
				// it always add one space at the end, so it's easier to read
				test.assert.equal(converter.engToMorse(i), morse.ABC[i] + " ");
			});
		});

		it("should skip invalid values", function() {
			var invalid = [":", ";", "<", "=", ">", "?", "@", "[", "\\", "]", "^", "_", "`", "|", "!", ".", ","];
			var count = 0;
			invalid.map(function(i) {
				test.assert.equal(converter.engToMorse(i), "");
			});
		});
	});
});
