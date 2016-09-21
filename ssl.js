var fs = require("fs");

/* ssl information */
module.exports = {
	/* set default port */
	port: 3030,
	
	/* database information */
	dbName: "nativecamping_db",
	dbHost: "localhost",
	dbUser: "root",
	dbPass: "root",
	dbTime: "+08:00", // set to japanese time
	
	/* ssl files */
	options: {
		key: fs.readFileSync('./ssl/gl_wildcard.nativecamp.net_2016.nopass.key'),
		cert: fs.readFileSync('./ssl/gl_wildcard.nativecamp.net_2016.crt'),
		ca: fs.readFileSync('./ssl/gl_wildcard.nativecamp.net_2016.chain')
	},
	
	/* allowed sites */
	origins: ""
};