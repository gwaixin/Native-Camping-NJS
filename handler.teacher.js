/* set dependencies */
var connect = require('./connect.js');
var model   = require('./model');
var util    = require('./util.js');

/* export teacher functions */
module.exports = {
	
	/**
	 * registers teacher in the teachers array
	 * @param obj -> will contain the teacher's information,
 	 * @param resolve -> execute if the process was successful
 	 * @param reject -> execute if the process failed
	 */
	registerTeacher: function(obj, resolve, reject, socket) {
		
		util.log("[TEACHER] register teacher to the room", "green");
		
		/* check if the teacher's array or data from teacher exists */
		if (typeof obj.teachers === undefined || typeof obj.data === undefined) {
			return reject("reason_invalid_teacher_params");
		}
		
		var data = obj.data;
		
		/* get the room index */
		var roomIndex = util.getIndex(connect.chatRooms, {room: data.chatHash});
		
		
		/* if the room does not exist, then create room */
		if (roomIndex <= -1) {
			util.log('[TEACHER_CONNECT] adding new room');
			connect.chatRooms.push({
				room: data.chatHash,
				teacher: data.teacherID,
				created: util.getCurrentTime(),
				teacherDisconnect: false
			});
			
		/* otherwise add teacher to the teacher's index */
		} else {
			connect.chatRooms[roomIndex].teacher = data.teacherID;
			connect.chatRooms[roomIndex].teacherDisconnect = false;
			// TODO
		}
		
		/* update onair connect flag to 1, so teacher has successfully registered in socket */
		model.updateOnair({connect_flg: 1}, {where: {chat_hash: data.chatHash}});
	},
	
	/**
	 * disconnect the teacher and end the lesson
	 * @param obj -> will contain the teacher's information,
	 * @param resolve -> execute if the process was successful
	 * @param reject -> execute if the process failed
	 */
	disconnectTeacher: function(obj, resolve, reject) {
		//TODO
	},
	
	/**
	 * disconnect the teacher and remove him/her from the room
	 * @param obj -> will contain the teacher's information
	 */
	teacherLeaveRoom: function(obj, socket, disconnection) {
		//TODO
	}
};