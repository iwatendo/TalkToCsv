var ForcedTimer = (
	function() {

		var counter = (
			function() {
				var count = 0;
				return function() {
					return count++;
				};
			}
		)();

		try {
			var ww = new Worker("/lib/forcedtimeworker.js");
		} catch(e) {
			return;
		}

		var timeoutFunctions = {};
		var intervalFunctions = {};

		var setTimeout_ = function(f, ms) {
			var id = counter();
			var innerId = "id_" + id;
			timeoutFunctions[innerId] = f;
			ww.postMessage(["setTimeout", id, ms].join(" "));
			return id;
		};

		var setInterval_ = function(f, ms) {
			var id = counter();
			var innerId = "id_" + id;
			intervalFunctions[innerId] = f;
			ww.postMessage(["setInterval", id, ms].join(" "));
			return id;
		};

		var clearTimeout_ = function(id) {
			var innerId = "id_" + id;
			if (!(innerId in timeoutFunctions)) {return;}
			delete timeoutFunctions[innerId];
			ww.postMessage(["clearTimeout", id].join(" "));
		};

		var clearInterval_ = function(id) {
			var innerId = "id_" + id;
			if (!(innerId in intervalFunctions)) {return;}
			delete intervalFunctions[innerId];
			ww.postMessage(["clearInterval", id].join(" "));
		};

		var onMessage = function(message) {
			dispose(message.data);
		};

		var dispose = function(message) {

			var params  = message.split(" ");
			var type    = params[0].toLowerCase();
			var id      = params[1];
			var innerId = "id_" + id;

			switch(type){
			case "timeout"  : if (!(innerId in timeoutFunctions )) {return;}; break;
			case "interval" : if (!(innerId in intervalFunctions)) {return;}; break;
			default: return;
			}

			switch(type){
			case "timeout":
				timeoutFunctions[innerId].call(window);
				delete timeoutFunctions[innerId];
				break;
			case "interval":
				intervalFunctions[innerId].call(window);
			}

		};

		ww.addEventListener(
			"message",
			onMessage
		);

		return {
			"setTimeout"    :setTimeout_,
			"setInterval"   :setInterval_,
			"clearTimeout"  :clearTimeout_,
			"clearInterval" :clearInterval_
		};

	}
)();
