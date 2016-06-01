// this is the source file for the morse encoding library.
// Author: Kristian Voshchepynets

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
		next: next
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
		// turn character into uppercase
		curr = this._iterator.next().toUpperCase();
		// add to output only if in Alphabet
		if (ABC[curr] != null) {
			// add one space after each character
			out += ABC[curr] + " ";
		}
	}
	return out;
}

// code for displaying the converted morse message
function Machine(board, led, conf) {
	this._board = board;
	this._led = led;
	this._dotTime = (conf != null && conf.dotTime != null) ? conf.dotTime : 400;
	this._dashTime = (conf != null && conf.dashTime != null) ? conf.dashTime : 800;
	this._blankTime = (conf != null && conf.blankTime != null) ? conf.blankTime : 400;
	this._sepTime = (conf != null && conf.sepTime != null) ? conf.sepTime : 1000;
	// make the process faster by eliminating conditionals
	this._responsibilities = {
		".": this.blink(this._dotTime, 1),
		"-": this.blink(this._dashTime, 1),
		" ": this.blink(this._blankTime, 0),
		"/": this.blink(this._sepTime, 0)
	}
}

// helper to blink once
Machine.prototype.blink = function(time, value) {
	var board = this._board,
		led = this._led;
	return function() {
		board.digitalWrite(led, value % 2); // make sure value is 0 or 1
		board.wait(time);
	}
}

/*Machine.prototype.dot = function(board, led) {
	console.log("led is: " + led);
	led.blink(this._dotTime);
}

Machine.prototype.dash = function(board, led) {
	led.blink(this._dashTime);
}

Machine.prototype.blank = function(board, led) {
	board.wait(this._blankTime);
}

Machine.prototype.separate = function(board, led) {
	board.wait(this._sepTime);
}*/

Machine.prototype.sendMessage = function(mes) {
	var words = mes.split(" / ");
	var led = this._led;
	var board = this._board;
	var resp = this._responsibilities;
	words.map(function(w) {
		// w is a word
		w.split("").map(function(c) {
			// "send" each character
			console.log("c is: " + c + " | resp[c] -> " + resp[c]);
			resp[c](); // call the associated function
		});
		// separate words
		resp["/"]();
	});
}

module.exports = {
	Machine: Machine,
	Converter: Converter,
	ABC: ABC
}
