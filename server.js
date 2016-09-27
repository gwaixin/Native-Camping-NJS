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
var constant = require("./constant.js");

/* socket connections */
connect.io.on('connection', function(socket) {
	util.log("[SOCKET_CONNECT] init", 'yellow');
	
	
	/**
	 * connect to room
	 * @param data -> configuration of connecting peer
	 */
	socket.on('common.connectToRoom', function(data) {
		// default parse
		var obj = {error: false, content: ''};
		util.log('[SOCKET_CONNECT] connect to room', 'yellow');
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
				util.logError('ERROR during connect Room : ' + obj.error);
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
		})
		/* when connecting to the room is success */
		.then(function() {
			/* clean any empty values */
			connect.chatRooms = util.compact(connect.chatRooms);

			/* set socket information */
			socket.userData = data;

			/* join socket room */
			socket.join(data.chatHash);

			util.log("[ROOM_CONNECTION] SUCCESS" + green);
		})
		/* problem during connecting to the room  */
		.catch(function(errors){
			logger.create('NJSEG11', data.chatHash, {data: data, error: errors});
			util.logError(" [ROOM_CONNECTION] " + errors);
			obj.error = true;
			obj.content = errors;
		})

		// always trigger this function
		.then(function(){
			return socket.emit('common.connectedToRoom', obj);
		});
	});
	
	/* socket disconnection */
	socket.on('disconnect', function(action) {
		util.log("[SOCKET_DISCONNECT] init", 'yellow');
		var userData = (typeof socket.userData !== 'undefined') ? socket.userData : null;
		
		/* if user data is empty return false */
		if (!userData) {
			util.log("[SOCKET_DISCONNECT] user data is empty", "yellow");
			return false;
		}
		
		/* try executing the disconnection logic */
		util.try(function(resolve, reject) {
			// get the member type
			var memberType = (typeof userData.memberType === 'undefined') ? 'unknown' : userData.memberType;
			var command = "lessonDisconnect";
			
			/* check which user will perform disconnection */
			switch(memberType) {
				case 'student': 
					command = constant.disconnect.student.sudden;
					handler.student.studentLeaveRoom({
						data: userData
					}, connect.io, action, resolve, reject);
					break;
				case 'teacher':
					command = constant.disconnect.teacher.sudden;
					handler.teacher.teacherLeaveRoom({
						data:userData
					}, connect.io, action, resolve, reject);
					break;
				case 'admin':
				 	// TODO
					break;
				default: 
					return reject('[SOCKET_DISCONNECT] member type unknown');
			}
			
			/* send sudden user disconnection emit */
			if (action !== "client namespace disconnect" && action !== "server namespace disconnect") {
				connect.io.in(userData.chatHash).emit('room.generalCommand', {command: command, content: userData});
			}
			
			/* resolve */
			return;
			
		})
		
		/* successful */
		.then(function(command) {
			util.log("[SOCKET_DISCONNECT] cleaning chatrooms", "yellow");
			/* clean any empty values */
			connect.chatRooms = util.compact(connect.chatRooms);
		})
		
		/* fail, catch any errors that may occur */
		.catch(function(errors) {
			util.logError("[SOCKET_DISCONNECT] " + errors);
		})
		
		// whether fail or success
		.then(function() {
			util.log("[CONNECTED_CLIENTS] -> " + connect.io.engine.clientsCount, "yellow");
			socket.leave();
		});
	});
});
