"use strict";

/* set dependencies */
var connect  = require('./connect.js');
var model    = require('./model');
var util     = require('./util.js');
var constant = require('./constant.js');

/* export teacher functions */
module.exports = {
	
	/**
	 * registers teacher in the teachers array
	 * @param obj -> will contain the teacher's information,
 	 * @param resolve -> execute if the process was successful
 	 * @param reject -> execute if the process failed
	 */
	registerTeacher: function(obj, resolve, reject, socket) {
		
		util.log("[TEACHER_REGISTER] init", "green");
		
		/* check if the teacher's array or data from teacher exists */
		if (typeof obj.teachers === undefined || typeof obj.data === undefined) {
			return reject("[TEACHER_REGISTER] reason_invalid_teacher_params");
		}
		
		var data = obj.data;
		
		/* get the room index */
		var roomIndex = util.getIndex(connect.chatRooms, {room: data.chatHash});
		util.log('[TEACHER_REGISTER] check if room is existing -> ' + roomIndex, 'green');
		
		/* if the room does not exist, then create room */
		if (roomIndex <= -1) {
			util.log('[TEACHER_REGISTER] adding new room', 'green');
			connect.chatRooms.push({
				room: data.chatHash,
				teacher: data.teacherID,
				created: util.getCurrentTime(),
				teacherDisconnect: false
			});
			
		/* otherwise add teacher to the teacher's index */
		} else {
			/* check if disconnection exist timer starts */
			if (typeof connect.chatRooms[roomIndex].teacherDisconnect !== 'undefined' && connect.chatRooms[roomIndex].teacherDisconnect !== false) {
				util.log('[TEACHER_REGISTER] stops teacher from disconnection ', 'green');
				clearTimeout(connect.chatRooms[roomIndex].teacherDisconnect);
			}
			
			/* update teacher chatroom data */
			connect.chatRooms[roomIndex].teacher = data.teacherID;
			connect.chatRooms[roomIndex].teacherDisconnect = false;
			
			// TODO
		}
		
		/* update onair connect flag to 1, so teacher has successfully registered in socket */
		model.updateOnair({
			connect_flg: 1
		}, {
			where: {
				chat_hash: data.chatHash
			}
		
		/* success on updating Onair */
		}).then(function() {
			return resolve();
		})
		
		/* catch any error during updating Onair  */
		.then(function(errors) {
			return reject(errors);
		});
	},
	
	/**
	 * disconnect the teacher and remove him/her from the room
	 * @param obj -> will contain the teacher's information
	 */
	teacherLeaveRoom: function(obj, socket, disconnection, resolve, reject) {
		util.log('[TEACHER_LEAVE_ROOM] init', 'green');
		
		/* check if the teachers array or data from teacher exists */
		if (typeof obj.data === undefined) {
			return reject("[TEACHER_LEAVE_ROOM] reason_inavlid_teacher_params");
		}
		
		/* get data */
		var data = obj.data;
		var element = this;
		
		/* get the room index */
		var roomIndex = util.getRoomIndexByChatHash(data.chatHash);
		util.log('[TEACHER_LEAVE_ROOM] check if room is existing index -> ' + roomIndex, "green");
		
		/* check room index */
		if (roomIndex > -1) {
			connect.chatRooms[roomIndex].teacher = null;
			util.log('[TEACHER_LEAVE_ROOM] teacher is now empty', "green");
		} else {
			return reject('[TEACHER_LEAVE_ROOM] cannot find roomIndex');
		}
		
		util.log('[TEACHER_LEAVE_ROOM] disconnection will be done after ' + constant.disconnect.timewait / 1000 + ' seconds', 'green');
		/* disconnection will be commit after timewait */
		connect.chatRooms[roomIndex].teacherDisconnect = setTimeout(function() {
			util.log('[TEACHER_LEAVE_ROOM] disconnection wait time is over proceed to disconnect', 'green');
			/* check if disconnection was abort */
			if (typeof connect.chatRooms[roomIndex] !== 'undefined' && connect.chatRooms[roomIndex].teacherDisconnect === false) {
				util.log('[TEACHER_LEAVE_ROOM] disconnection was aborted already', 'green');
				return;
			}
			
			if (typeof element.disconnectTeacher === 'function') { 
				obj.lessonFinish = 5;
				
				element.disconnectTeacher(obj, resolve, reject);
				
				/* sends signal to other party that this teacher will leave */
				socket.in(data.chatHash).emit('room.generalCommand', {command: constant.disconnect.teacher.timeOut, content:data});
			} else {
				reject('disconnectTeacher function does not implemented yet');
			}
		}, constant.disconnect.timewait);
	},
	
	/**
	 * disconnect the teacher and end the lesson
	 * @param obj -> will contain the teacher's information,
	 * @param resolve -> execute if the process was successful
	 * @param reject -> execute if the process failed
	 */
	disconnectTeacher: function(obj, resolve, reject) {
		util.log("[TEACHER_DISCONNECT] init", "green");
		
		/* check if the teacher has data */
		if (typeof obj.data === 'undefined') {
			return reject("[TEACHER_DISCONNECT] no teacher's data");
		}
		
		/* check lesson finish */
		if (typeof obj.lessonFinish === 'undefined') {
			return reject("[TEACHER_DISCONNECT] no lesson's finish");
		}
		
		/* get vars */
		var data = obj.data;
		
		/* clear the lesson */
		model.clearLesson({chat_hash: data.chatHash}, data, obj.lessonFinish)
		
		/* success on clearing the lesson */
		.then(function() {
			/* find chatroom index */
			var roomIndex = util.getRoomIndexByChatHash(data.chatHash);
			util.log('[TEACHER_DISCONNECT] check if room is existing index -> ', 'green');
			
			/* check room index */
			if (roomIndex > -1) {
				delete connect.chatRooms[roomIndex];
				util.log('[TEACHER_DISCONNECT] removed room -> ' + data.chatHash, 'green');
			}
			
			return resolve();
		})
		
		/* error on clearing the lesson */
		.catch(function(errors) {	
			return reject(errors);
		});
	},
};