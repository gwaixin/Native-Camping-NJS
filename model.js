var util = require('./util.js');
var db = require('./database.js');
var moment = require('moment');

/* export models function */
module.exports = {
	
	/**
	 * update lesson onairs table
	 * @param  Object values   lesson onairs updated column
	 * @param  Object where    filter onairs
	 * @return Boolean         return if has succesfully updated
	 */
	updateOnair: function(values, where) {
		util.log("[DB] update onair values -> " + JSON.stringify(values) + " condition -> " + JSON.stringify(where));
		return db.onairs.update(values, where);
	}
};