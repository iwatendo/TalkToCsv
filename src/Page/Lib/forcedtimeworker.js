var sender = function(id) {
	return function() {
		postMessage(id);
	};
};

var binder = function(f, that, args) {
	return function() {
		f.apply(that, args);
	};
};

var functionsCaller = function(functions) {
	return function() {
		for (var i=0,l=functions.length; i < l; i++) {
			functions[i]();
		}
	};
};

var timeoutIds  = {};
var intervalIds = {};

var onMessage = function(message) {
	dispose(message.data);
};

var dispose = function(message) {

	var params  = message.split(" ");
	var type    = params[0].toLowerCase();
	var id      = params[1];
	var ms      = params[2];
	var innerId = "id_" + id;

	switch(type){
	case "settimeout"    : if ( (innerId in timeoutIds )) {return;}; break;
	case "setinterval"   : if ( (innerId in intervalIds)) {return;}; break;
	case "cleartimeout"  : if (!(innerId in timeoutIds )) {return;}; break;
	case "clearinterval" : if (!(innerId in intervalIds)) {return;}; break;
	default: return;
	}

	switch(type){
	case "settimeout":
		var callbackTimeouts = [
			sender(["timeout", id].join(" ")),
			binder(arguments.callee, this, [["clearTimeout", id].join(" ")])
		];
		timeoutIds[innerId] = setTimeout(
			functionsCaller(callbackTimeouts),
			parseInt(ms, 10)
		);
		break;
	case "setinterval":
		var callbackIntervals = [
			sender(["interval", id].join(" "))
		];
		intervalIds[innerId] = setInterval(
			functionsCaller(callbackIntervals),
			parseInt(ms, 10)
		);
		break;
	case "cleartimeout":
		clearTimeout(timeoutIds[innerId]);
		delete timeoutIds[innerId];
		break;
	case "clearinterval":
		clearInterval(intervalIds[innerId]);
		delete intervalIds[innerId];
		break;
	}

};

addEventListener(
	"message",
	onMessage
);
