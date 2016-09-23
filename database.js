
var sequelize = require("sequelize");
var util      = require("./util.js");
var ssl       = require("./ssl.js");

/* set database connection */
var db = new sequelize(
	ssl.dbName,
	ssl.dbUser,
	ssl.dbPass,
	{
		dialect: "mysql",
		timezone: ssl.dbTime,
		host: ssl.dbHost,
		logging: function(str) {
			util.log("[SQL] " + str, 'white', 'black');
		}
	}
);

/* try connecting to the database */
db.authenticate().then(function(errors) {
	/* check if errors exist */
	if (typeof errors !== 'undefined') {
		util.log(errors, 'white', 'red');
		process.exit();
	}
});

/* export tables and database connection */
module.exports = {
	sequelize: sequelize,
	connection: db,
	
	/* onairs table */
	onairs: db.define('onairs', {
		teacher_id: sequelize.INTEGER,
		student_id: sequelize.INTEGER,
		status: sequelize.INTEGER,
		connect_flg: sequelize.INTEGER,
		chat_hash: sequelize.STRING,
		wait_start_time: sequelize.DATE,
		wait_end_time: sequelize.DATE,
		start_time: sequelize.DATE,
		end_time: sequelize.DATE,
		lesson_type: sequelize.INTEGER,
		web_rtc_type: sequelize.INTEGER,
		lesson_finish: sequelize.INTEGER,
		created_at: sequelize.DATE,
		updated_at: sequelize.DATE
	}, {
		timestamps: true,
		createdAt: 'created_at',
		updatedAt: 'updated_at',
		deletedAt: false
	}),
	
	/* onair logs table */
	onair_logs: db.define('onair_logs', {
		teacher_id: sequelize.INTEGER,
		student_id: sequelize.INTEGER,
		status: sequelize.INTEGER,
		connect_flg: sequelize.INTEGER,
		chat_hash: sequelize.STRING,
		wait_start_time: sequelize.DATE,
		wait_end_time: sequelize.DATE,
		start_time: sequelize.DATE,
		end_time: sequelize.DATE,
		lesson_type: sequelize.INTEGER,
		web_rtc_type: sequelize.INTEGER,
		lesson_finish: sequelize.INTEGER,
		created_at: sequelize.DATE,
		updated_at: sequelize.DATE
	}, {
		timestamps: true,
		createdAt: 'created_at',
		updatedAt: 'updated_at',
		deletedAt: false
	}),
	
	/* users table */
	users: db.define('users', {
		email: sequelize.STRING,
		password: sequelize.STRING,
		fname: sequelize.STRING,
		mname: sequelize.STRING,
		lname: sequelize.STRING,
		address: sequelize.STRING,
		country: sequelize.STRING,
		user_type: sequelize.INTEGER,
		status: sequelize.INTEGER
	}, {timestamps: true, deletedAt: false})
};


