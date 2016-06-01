/*  Name: English to Morse Translator. Author: Kristian Voshchepynets. Description: English to Morse Translator for the Arduino, written in JavaScript with johnny-five framework. It displays a message through LED's on your Arduino.
    Copyright (C) 2016 Kristian Voshchepynets

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

var lib = require("./lib/_morselib.js"),
	converter = new lib.Converter(),
	machine,
	five = require("johnny-five"),
	board = new five.Board(),
	timeline = lib.timeline;

function translate(mes) {
	if (machine != null) {
		console.log("Check out your Arduino - it tells you:\n" + mes);
		machine.sendMessage(converter.engToMorse(mes));
		timeline.execute();
	} else
		console.log("Please wait a second, it seems like the board isn't ready yet!");
		
}

board.on("ready", function() {
	/* create led on pin 13 */
	var ledNum = 13;
	var led = new five.Led(ledNum);

	machine = new lib.Machine(board, ledNum);

	/* Inject the needed object and functions here: */
	this.repl.inject({
		led: led,
		ledNum: ledNum,
		board: board,
		machine: machine,
		converter: converter,
		translate: translate,
		timeline: timeline
	});
	/* A little greeting from me :) */
	console.log("\nEnglish to Morse  Copyright (C) 2016  Kristian Voshchepynets\n    This program comes with ABSOLUTELY NO WARRANTY;\n    This is free software, and you are welcome to redistribute it\n    under certain conditions;");
	console.log("ALLRIGHT! All the setup done. Use the REPL to translate your messages.\n    Usage: translate(<message>);");
	console.log("Little test: hello");
	translate("hello");
});

