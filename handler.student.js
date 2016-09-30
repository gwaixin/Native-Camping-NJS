"use strict";

var util     = require('./util.js');
var model    = require('./model.js');
var connect  = require('./connect.js');
var constant = require('./constant.js');

module.exports = {
	
	registerStudent: function(obj, resolve, reject, socket) {
		util.log("[STUDENT_REGISTER] register student to the room", "green");
		/* check if the students array or data from student exists */
		if (typeof obj.data === undefined) {
			util.logError("[STUDENT_REGISTER] reason_invalid_student_params");
			return reject("[STUDENT_REGISTER] reason_invalid_student_params");
		}
		
		var data = obj.data;
		
		/* getting room index */
		var roomIndex = util.getRoomIndexByChatHash(data.chatHash);
		util.log('[STUDENT_REGISTER] check if room is existing -> ' + roomIndex, 'green');
		
		/* check if room */
		if (roomIndex <= -1) {
			return reject("[STUDENT_REGISTER] reason_no_room");
		}
		
		/* check if student is already in the room */
		if (
			typeof connect.chatRooms[roomIndex].user !== 'undefined' &&
			connect.chatRooms[roomIndex].user !== null
		) {
			/* force reconnect student */
			util.log('[STUDENT_REGISTER] force reconnect student', 'green');
		}
		
		/* check if disconnection exist timer starts */
		if (typeof connect.chatRooms[roomIndex].studentDisconnect !== 'undefined' && connect.chatRooms[roomIndex].studentDisconnect !== false) {
			util.log('[STUDENT_REGISTER] stops student from disconnection ', 'green');
			clearTimeout(connect.chatRooms[roomIndex].studentDisconnect);
		}
		
		/* insert the student int the room */
		util.log("[STUDENT_REGISTER] adding student to the room", "green");
		connect.chatRooms[roomIndex].user = data.userID;
		connect.chatRooms[roomIndex].studentDisconnect = false;
		
		/* if chatroom isnt started, trigger lesson start */
		if (
			typeof connect.chatRooms[roomIndex].start === 'undefined' || 
			connect.chatRooms[roomIndex].start === ''
		) {
			util.log("[STUDENT_REGISTER] triggers start lesson", "green");
			connect.chatRooms[roomIndex].start = util.getCurrentTime();
		}
		
		return resolve();
	},
	
	/**
	 * initiate student leaving the chat room before disconnecting to socket
	 * @param  {object} obj           student's data
	 * @param  {object} socket        sockets object
	 * @param  {String} disconnection type of disconnection
	 * @param  {Promise} resolve      function for successful promise
	 * @param  {Promise} reject       function for fail promise
	 */
	studentLeaveRoom: function(obj, socket, disconnection, resolve, reject) {
		util.log("[STUDENT_LEAVE_ROOM] init" + JSON.stringify(obj), "green");
		
		/* check if obj has data */
		if (typeof obj.data === 'undefined') {
			return reject("[STUDENT_LEAVE_ROOM] reason_invalid_student_params", "green");
		}
		
		/* set vars */
		var data = obj.data;
		var element = this;
		
		/* get the chat room index */
		var roomIndex = util.getRoomIndexByChatHash(data.chatHash);
		util.log("[STUDENT_LEAVE_ROOM] check if room is existing index -> " + roomIndex, "green");
		
		/* check room index */
		if (roomIndex > -1) {
			connect.chatRooms[roomIndex].user = null;
			util.log('[STUDENT_LEAVE_ROOM] student is now empty', "green");
		} else {
			return reject('[STUDENT_LEAVE_ROOM] student already left');
		}
		
		util.log('[STUDENT_LEAVE_ROOM] disconnection will be done after ' + constant.disconnect.timewait / 1000 + ' seconds', 'green');
		/* disconnection will be commit after timewait */
		connect.chatRooms[roomIndex].studentDisconnect = setTimeout(function() {
			/* check if disconnection was abort */
			if (typeof connect.chatRooms[roomIndex] !== 'undefined' && connect.chatRooms[roomIndex].studentDisconnect === false) {
				util.log('[STUDENT_LEAVE_ROOM] disconnection was aborted already', 'green');
				return;
			}
			/* proceed to disconnection */
			if (typeof element.disconnectStudent === 'function') { 
				obj.lessonFinish = 5;
				
				element.disconnectStudent(obj, resolve, reject); 
			} else {
				reject('disconnectStudent function does not implemented yet');
			}
			
			/* sends signal to other party that this student will leave */
			return socket.in(data.chatHash).emit('room.generalCommand', {command: constant.disconnect.student.timeOut, content: data});
			
		}, constant.disconnect.timewait);
	},
	
	/**
	 * disconnect the teacher from the socket
	 * @param  {object} obj       student's data
	 * @param  {Promise} resolve  successful Promise
	 * @param  {Promise} reject   fail Promise
	 */
	disconnectStudent : function(obj, resolve, reject) {
		util.log("[STUDENT_DISCONNECT] init", "green");
		
		/* check student data */
		if (typeof obj.data === 'undefined') {
			return reject("[STUDENT_DISCONNECT] reason_invalid_student_params", "green");
		}
		
		/* check lesson finish */
		if (typeof obj.lessonFinish === 'undefined') {
			return reject("[STUDENT_DISCONNECT] reason_no_lesson_finish", "green");
		}
		
		/* set vars */
		var data = obj.data;
		
		/* clearing the lesson */
		model.clearLesson({chat_hash: data.chatHash}, data, obj.lessonFinish)
		
		/* success on clearing the lesson */
		.then(function() {
			/* get the room index */
			var roomIndex = util.getRoomIndexByChatHash(data.chatHash);
			util.log("[STUDENT_DISCONNECT] check if room is existing index -> " + roomIndex, "green");
			
			/* delete room if it does exist */
			if (roomIndex > -1) {
				delete connect.chatRooms[roomIndex];
				util.log("[STUDENT_DISCONNECT] remove room -> " + data.chatHash, "red");
			}
			return resolve();
		})
		
		/* fail upon clearing the lesson */
		.catch(function(errors) {
			util.errorLog("[STUDENT_DISCONNECT] error -> " + errors);
			return reject(errors);
		});
	},
};