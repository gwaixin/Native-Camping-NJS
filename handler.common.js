'use strict';

var util = require('./util.js');

/* export */
module.exports = {
	sendChat: function(obj, resolve) {
		util.log("[COMMON] send chat init" + JSON.stringify(obj), 'white');
		resolve();
	}
};