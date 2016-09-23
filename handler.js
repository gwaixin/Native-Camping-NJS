/**
 * - this file will contain the socket events
 * to and from the signaling server
 * - function list for the signaling actions
 */
module.exports = {
	teacher: require('./handler.teacher.js'),
	student: require('./handler.student.js')
};