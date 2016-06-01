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


/* 	This is the source file for the morse encoding library.
	It includes all the modules and the logic that is needed
	to process English messages and convert them into Morse Code
	as well as a controller for sending the right commands to the board.
	The program is executed in an asynchronous way, that's why it uses 
	Node's "events" module. The code is well-tested and hopefully easy to read.
	Let me know if anything: kristian.pentahack@gmail.com
*/

/* requires events module here */
var events = require('events'),
	eventEmitter = new events.EventEmitter();

/* create a global timeline object to control the flow of the program */
const timeline = (function() {
	const steps = [];
	
	function hasNext() {
		return steps.length > 0 && typeof steps[0] === "function";
	}

	function next() {
		return steps.shift();
	}

	function push(el) {
		steps.push(el);
	}

	function execute() {
		// simply emit event
		eventEmitter.emit("nextStep");
	}

	return {
		execute: execute,
		steps: steps,
		next: next,
		hasNext: hasNext,
		push: push
	};

})();

/* Add event listener for a custom event. Each function emits "nextStep" when done */
eventEmitter.addListener("nextStep", function() {
	if (timeline.hasNext())
		(timeline.next())();
});

/* This is the alphabet that's used for Morse. */
const ABC = {
"A": ".-",
"B": "-...",
"C": "-.-.",
"D": "-..",
"E": ".",
"F": "..-.",
"G": "--.",
"H": "....",
"I": "..",
"J": ".---",
"K": "-.-",
"L": ".-..",
"M": "--",
"N": "-.",
"O": "---",
"P": ".--.",
"Q": "--.-",
"R": ".-.",
"S": "...",
"T": "-",
"U": "..-",
"V": "...-",
"W": ".--",
"X": "-..-",
"Y": "-.--",
"Z": "--..",
"0": "-----",
"1": ".----",
"2": "..---",
"3": "...--",
"4": "....-",
"5": ".....",
"6": "-....",
"7": "--...",
"8": "---..",
"9": "----.",
" ": " / ",
"\n": " / ",
"\t": " / " // separate words and paragraphs with slash
}

/* A very basic iterator for the input string */
function iterator(input) {
	var i = 0;
	function next() {
		return input[i++];
	}

	function hasNext() {
		// is not null and not undefined
		return input[i] != null;
	}

	function feed(inp) {
		input = inp;
	}

	return {
		hasNext: hasNext,
		next: next,
		feed: feed
	};
}

function Converter() {
	this._iterator = iterator("");	
}

Converter.prototype.engToMorse = function(message) {
	// here goes the conversion
	this._iterator = iterator(message);
	var curr,
		out = "";

	while (this._iterator.hasNext()) {
		/* turn character into uppercase */
		curr = this._iterator.next().toUpperCase();
		/* add to output only if in Alphabet */
		if (ABC[curr] != null) {
			/* add one space after each character */
			out += ABC[curr] + " ";
		}
	}
	return out;
}

// code for displaying the converted morse message
function Machine(board, led, conf) {
	this._board = board;
	this._led = led;
	this._dotTime = (conf != null && conf.dotTime != null) ? conf.dotTime : 500;
	this._dashTime = (conf != null && conf.dashTime != null) ? conf.dashTime : 1000;
	this._blankTime = (conf != null && conf.blankTime != null) ? conf.blankTime : 500;
	this._sepTime = (conf != null && conf.sepTime != null) ? conf.sepTime : 1000;
	this._treshold = (conf != null && conf.treshold != null) ? conf.treshold : 100;
	/* make the process faster by eliminating conditionals */
	this._responsibilities = {
		".": this.blink(this._dotTime, 1),
		"-": this.blink(this._dashTime, 1),
		" ": this.blink(this._blankTime, 0),
		"/": this.blink(this._sepTime, 0)
	}
}

/* helper to blink once */
Machine.prototype.blink = function(time, value) {
	var board = this._board,
		led = this._led,
		treshold = this._treshold;

	return function() {
		value = value % 2;
		board.digitalWrite(led, value % 2); // make sure value is 0 or 1
		board.wait(time - treshold, function() {
			board.digitalWrite(led, 0);
			/*
			**	the pin should turn off, so you can distinguish between signals.
			**	Set the treshold to a level you like by using the "config" parameter
			**	in the constructor of Machine
			*/
			board.wait(treshold, function() {
				/* emit event here. After this the next step will execute */
				eventEmitter.emit("nextStep");
			});
		});
	}
}

Machine.prototype.sendMessage = function(mes) {
	var words = mes.split(" / ");
	var led = this._led;
	var board = this._board;
	var resp = this._responsibilities;
	words.map(function(w) {
		/* w is a word */
		w.split("").map(function(c) {
			/* "send" each character of each word */
			timeline.steps.push(resp[c]); /* call the associated function */
		});
		/* separate words with long blanks (set the led off) */
		timeline.steps.push(resp["/"]); /* call the associated function */
	});
}

module.exports = {
	ABC: ABC,
	Converter: Converter,
	Machine: Machine,
	timeline: timeline
}
