var lib = require("./lib/_morselib.js"),
	converter = new lib.Converter(),
	machine;

var five = require("johnny-five"),
	board = new five.Board();

board.on("ready", function() {
	// create led on pin 13
	var led = new five.Led(13);
	var conv = converter.engToMorse("Hello World!");

	// strobe the pin on/off, defaults to 100ms
	machine = new lib.Machine(board, 13); // 13 is the pin number
//	console.log(led.blink);
//	machine.sendMessage(conv);
/*	led.blink(100);
	led.stop().off();
	setTimeout(function() {
		led.blink(500);
	}, 1000);*/
	console.log("ALLRIGHT! MEssage sent");
	machine.blink(1000, 1);
	this.repl.inject({
		led: led,
		machine: machine,
		converter: converter
	});
});

