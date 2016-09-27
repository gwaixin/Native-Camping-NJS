var _ = require('underscore');
var promise = require("promise");
var chalk = require('chalk');
var moment = require('moment');
var connect = require('./connect.js');

module.exports = {
	/**
	 * try executing a function
	 * @param f: function to be executed
	 */
	try: function(f){
		return new Promise(f);
	},
	
	log: function(message, color, bgColor) {
		bgColor = (typeof bgColor !== 'undefined') ? 'bg' + bgColor.charAt(0).toUpperCase() + bgColor.slice(1) : 'bgBlack';
		color = (typeof color === 'undefined') ? 'white' : color;
		
		/* format message */
		message = this.getCurrentTime() + " >> " + message;
		
		/* log */
		try {
			return console.log(chalk[color][bgColor](message));
		} catch(ex) {
			this.log(ex.toString(), 'white', 'red');
			return process.exit();
		}
	},
	
	/**
	 * log error messages
	 * @param message : content of error 
	 */
	logError: function(message) {
		/* error message should not be empty */
		if (typeof message === 'undefined' || message.length === 0) {
			return false;
		}
		
		/* log the error */
		return this.log("[ERROR] " + message, 'red', 'white');
	},
	
	/**
	 * get the current time
	 * @param format: set the current format
	 */
	getCurrentTime : function(format) {
		/* set format*/
		format = (typeof format === 'undefined') ? "YYYY-MM-DD HH:mm:ss" : format;
		
		return moment().format(format);
	},
	
	/**
	 * get the index of an element from an array
	 * @param  Array  list       array of option 
	 * @param  String filter     use to search in array
	 * @return Int               index of an array
	 */
	getIndex: function(list, filter) {
		var index = _.findLastIndex(list, filter);
		return index;
	},
	
	/**
	 * get the room index from chatrooms
	 * @param  {String} chatHash   unique identifier for chatrooms
	 * @return {int}               chathash room index
	 */
	getRoomIndexByChatHash: function(chatHash) {
		/* check chatrooms if it is empty then return -1 */
		if (typeof connect.chatRooms === 'undefined') {
			return -1;
		}
	
		var index = _.findLastIndex(connect.chatRooms, {room: chatHash});
		return index;
	},
	
	/**
	 * remove useless indices
	 * in an array
	 * @param: array
	 */
	compact: function(list){
		return _.compact(list);
	},
	
	/**
	 * extend the object
	 */
	 extend: function(parent, child) {
		 return _.extend({}, parent, child);
	 },
	
};