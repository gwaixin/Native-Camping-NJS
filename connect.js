/* set dependencies */

var fs = require("fs");
var express = require("express"); // routing
var app = express(); // server

/* load external javascript libraries */
var ssl = require("./ssl.js");

/* set server */
var server = require('https').createServer(ssl.options, app);
var io     = require("socket.io").listen(server, {"origins": ssl.origins, "pingTimeout": 30000, "pingInternal": 5000});
var socket = io.sockets;
var peer   = require("peer").ExpressPeerServer;

/* set app engine peer */
app.use('/peerjs', peer(server, {debug: true}));

app.use('/testing', function(req, res) {
	res.send('Hello World!');
	console.log("testing lang daw");
});

/* listen to default port 0.0.0.0 */
var server = server.listen(ssl.port, "0.0.0.0", function(){ 
	console.log("server listining port");
});

/* export */
exports.io = io; // socket.io object

/* chatrooms */
exports.chatRooms = [{
	room: '',
	created: '',
	start:'',
	user: null, 
	teacher: null,
	studentDisconnect: false,
	teacherDisconnect: false
}];