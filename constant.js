"use strict";
/* This will be use for constants logs and settings */

module.exports = {
	/* average lesson time is 26 minutes */
	lesson: {
		lessonTime: 1560
	},
	
	/* connect pattern */
	connect: {
		teacher: {
			success: "teacherConnected",
			failed: "teacherFailConnect"
		},
		student: {
			success: 'studentConnected',
			fail: 'studentFailConnect'
		}
	},
	
	/* disconnect patterns */
	disconnect: {
		timewait: 60000, // 1 minute timeout delay
		teacher: {
			finished: "teacherLessonFinished",
			sudden: "teacherSuddenDisconnect",
			others: "teacherLessonDisconnectOthers",
			timeOut: "teacherTimedOut",
			forceReconnect: "teacherForceReconnect",
		},
		student: {
			finished: "studentLessonFinished",
			sudden: "studentSuddenDisconnect",
			timeOut: "studentTimedOut",
			forceReconnect: "studentForceReconnect",
		}
	}
};