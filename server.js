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
				util.logError('[ROOM_CONNECTION] ERROR during connect Room : ' + obj.error);
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

			util.log("[ROOM_CONNECTION] SUCCESS", 'yellow');
		})
		/* problem during connecting to the room  */
		.catch(function(errors){
			logger.create('NJSEG11', data.chatHash, {data: data, error: errors});
			util.logError("[ROOM_CONNECTION] " + errors);
			obj.error = true;
			obj.content = errors;
		})

		// always trigger this function
		.then(function(){
			return socket.emit('common.connectedToRoom', obj);
		});
	});
	
	/**
	 * @data: object
	 * @data.command: type of command to be executed
	 * @data.content: content of command, will depend on the command source
	 * @callback: execute callback
	 */
	socket.on('room.generalCommand', function(data) {
		/* default parse */
		var obj = {error: false, content: ''};
		
		/* check if the data variable contains valid values */
		if (typeof data.command === 'undefined' || typeof data.content === 'undefined') {
			obj.error = true;
			obj.content = "reason_invalid_room_command";
			util.logError('[SOCKET_GENERAL_CMD] ' + obj.content, 'yellow');
			return socket.emit('room.generalCommandSent', obj);
		}
		
		/* set vars */
		var command = data.command;
		var content = data.content;
		var mode = (typeof data.mode === 'undefined') ? 'all' : data.mode;
		var lessonFinish = 0;
		
		/* try executing general command */
		util.try(function(resolve, reject) {
			
			/* determine which command was called */
			switch(command) {
				/* teacher lesson disconnection set status */
				case 'lessonDisconnect': lessonFinish = 1; break;               // when lesson is done, disconnect
				case 'teacherLessonDisconnectOthers': lessonFinish = 2; break;  // when teacher go to others
				case 'teacherTimedOut': lessonFinish = 3; break;                // when teacher got timeout
				
				/* student end lesson */
				case 'studentLessonFinished': 
					lessonFinish = 4; 
					handler.student.disconnectStudent({
						data: content,
						lessonFinish: lessonFinish
					}, resolve, reject);
					break;
				
				/* sending chat */
				case 'sendChat': 
					handler.common.sendChat({
						data: content,
						mode: 'to'
					}, resolve);
					break;
			}
			
			
			/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
			 * special cases that will be using common functions will be handle here *
			 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
			 
			/* handle teacher disconnection */
			if (
				command === 'lessonDisconnect' ||
				command === 'teacherTimedOut'  ||
				command === 'teacherLessonDisconnectOthers'
			) {
				handler.teacher.disconnectTeacher({
					data: content,
					lessonFinish: lessonFinish
				}, resolve, reject);
			}
		})
		/* after successfully executing general command */
		.then(function() {
			/* clean any empty values */
			connect.chatRooms = util.compact(connect.chatRooms);
			/* broadcast only to other party */
			if (mode === 'to') {
				socket.broadcast.to(content.chatHash).emit('room.generalCommand', data);
			/* broadcast including sender */
			} else {
				connect.io.in(content.chatHash).emit('room.generalCommand', data);
			}
			
			// set content
			obj.command = command;
			obj.error = false;
			obj.content = data;
		})
		
		/* problem during executing general command */
		.catch(function(errors) {
			util.logError("[GENERAL_COMMAND] error: " + errors);
			obj.error = true;
			obj.content = errors;
		})
		
		/* always trigger whether fail or success */
		.then(function() {
			obj = ({
				command: command,
				content: data.content,
				error: obj.error
			});
			return socket.emit('room.generalCommandSent', obj);
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
