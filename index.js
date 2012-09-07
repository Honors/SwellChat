var io = require('socket.io').listen(3006);
var http = require('http');
var fs = require('fs');

exports.module = http.createServer(function(req, res) {
	var read = fs.createReadStream(__dirname+"/index.html");
	res.writeHead(200, {'Content-Type': 'text/html'});
	read.pipe(res);
});

var users = {};
io.sockets.on('connection', function (socket) {
	socket.on("login", function(data) {
		console.log("Welcome, "+data);
		users[data] = socket;
	});
	socket.on("next msg", function(data) {
		if( users[data] ) {
			users[data].emit('next msg');
		}
	});
	socket.on('touch event', function (data) {
		if( users[data[0]] ) {
			users[data[0]].emit('touch event', data[1]);
		}
	});
});