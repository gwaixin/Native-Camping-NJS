var util = require('./util.js');
// var constant = require('./constant.js');
// var db = require
var connect = require('./connect.js');

module.exports = {
	registerStudent: function(obj, resolve, reject, socket) {
		console.log("testing na solod na dere");
		/* check if the students array or data from student exists */
		if (typeof obj.data === undefined) {
			return reject("reason_invalid_student_params");
		}
		
		util.log("[STUDENT] adding student to the room", "green");
	},
	disconnectStudent : function() {
		//TODO
	},
	studentLeaveRoom: function() {
		//TODO
	}
};