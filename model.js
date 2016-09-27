'use strict';

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
	},
	
	clearLesson: function(condition, data, lessonFinish) {
		util.log("[DB] clearing of lesson ->" + JSON.stringify(data) + " condition -> " + JSON.stringify(condition));
		
		/* process lesson finish */
		lessonFinish = (typeof lessonFinish !== 'undefined') ? lessonFinish : 0;
		
		return util.try(function(resolve, reject) {
			/* search for lesson onairs */
			db.onairs
				.findOne({
					where: condition
				})
				/* success in query */
				.then(function(onairs) {
					/* checks response */
					if (!onairs) {
						util.log("[DB][CLEAR_LESSON] no onairs");
						return resolve("reason_no_onairs");
					}
					
					/* set vars */
					onairs = onairs.dataValues;
					
					/* get onair id */
					var onairID = onairs.id;
					
					/* delete onairs_id */
					delete onairs.id;
					
					/* set the end_time to the current time */
					onairs.end_time = util.getCurrentTime();
					
					/* add additional column values */
					var onairLogs = util.extend(onairs, {
						onair_id: onairID,
						lesson_finish: lessonFinish
					});
					
					
					/* check if status is not ongoing lesson */
					if (onairs.status !== 3) {
						/* remove the onairs table value */
						db.onairs
							.destroy({where: condition})
							/* if lesson onair was destroyed successfully */
							.then(function() { return resolve(onairs); })
							/* or if an error occured */
							.catch(function(errors) { return reject(errors); });
					}
					
					/* check if it is already exist on onair_logs */
					db.onair_logs
						.findOne({
							where: condition
						})
						
						/* query successful finding on onair_logs */
						.then(function(data) {
							/* check if it does exist */
							if (data) {
								util.log("[DB] onair has already logged.");
								return resolve(data.dataValues);
							}
							
							/* create logs from onair */
							db.onair_logs
								.create(onairLogs)
								/* create success */
								.then(function(data) {
									/* remove the onairs table */
									db.onairs.destroy({where: condition})
										.then(function() { return resolve(data); })          // success
										.catch(function(errors) { return reject(errors); }); // error
								})
								/* catch error during create */
								.catch(function(errors) {
									return reject(errors);
								});
						})
						/* error on finding onair_logs */
						.catch(function(errors) {
							return reject(errors);
						});
				});
		});
	}
};