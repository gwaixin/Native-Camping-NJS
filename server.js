// OLD REFERENCE
// initialize vars
// var express = require('express');
// var app     = express();
// 
// // Prepare for io
// var http = require('http').Server(app);
// var io = require('socket.io')(http);
// 
// // server connection
// io.on('connection', function(client) {
// 	
// 	// client disconection
// 	client.on('disconection', function() {
// 		
// 	});
// }); 
// 
// // start server
// http.listen(3030, function() {
// 	console.log('Native Camping is listeneing on port 3030!');
// });

var connect = require("./connect.js");
var handler = require("./handler.js");
var util    = require("./util.js");

/* socket connections */
connect.io.on('connection', function(socket) {
	console.log("socket connect hahah");
	
	
	/**
	 * connect to room
	 * @param data -> configuration of connecting peer
	 */
	socket.on('common.connectToRoom', function(data) {
		// default parse
		var obj = {error: false, content: ''};
		console.log('connecting to room');
		// create new promise
		util.try(function(resolve, reject) {
			if (typeof data.chatHash === 'undefined') {
				obj.content = "reason_unknown_chat_hash";
				obj.error = true;
				return reject(obj);
			}
			
			// if member type is not valid
			if (typeof data.memberType === 'undefined') {
				obj.content = "reason_unknown_member_type";
				obj.error = true;
				return reject(obj);
			}
			
			/* check if there is an error */
			if (obj.error) {
				console.log('ERROR during connect Room : ', obj.error);
			} 
			
			//identify memberType
			switch (data.memberType) {
				// register the teacher to the teacher's room
				case 'teacher':	
					handler.teacher.registerTeacher({
						data: data
					}, resolve, reject, socket);
					break;
				// register the student to the student's room
				case 'student':
					handler.student.registerStudent({
						data: data
					}, resolve, reject, socket);
					break;
			}
		}).then(function() {
			console.log("success");
		}, function(err) {
			console.log("[SOCKET] error on connect room, reason : ", err);
		});
	});
});
