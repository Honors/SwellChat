var io = require('socket.io').listen(3006);
var http = require('http');
var fs = require('fs');
var mongoose = require('mongoose');

var getUser = function(criteria, cb) {
	var db = mongoose.createConnection('localhost', 'test');
	var schema = mongoose.Schema({
		"username": String,
		"password": String
	});
	var ChatUser = db.model('ChatUser', schema);
	ChatUser.find(criteria, cb);
};
var getFriends = function(username, cb) {
	var db = mongoose.createConnection('localhost', 'test');
	var schema = mongoose.Schema({
		"username": String,
		"friend": String
	});
	var ChatUserFriendship = db.model('ChatUserFriendship', schema);
	ChatUserFriendship.find({'username': username}, cb);
};
var setFriends = function(user, friend) {
	var db = mongoose.createConnection('localhost', 'test');
	var schema = mongoose.Schema({
		"username": String,
		"friend": String
	});
	var ChatUserFriendship = db.model('ChatUserFriendship', schema);
	
	var user = new ChatUserFriendship({
		'username': user,
		'friend': friend
	});
	user.save(function (err) {
		// handle err...
	});
};
var makeUser = function(user, password) {
	var db = mongoose.createConnection('localhost', 'test');
	var schema = mongoose.Schema({
		"username": String,
		"password": String
	});
	var ChatUserFriendship = db.model('ChatUsers', schema);
	
	var user = new ChatUserFriendship({
		'username': user,
		'password': password
	});
	user.save(function (err) {
		// handle err...
	});
};
var checkLogin = function(criteria, cb) {
	var db = mongoose.createConnection('localhost', 'test');
	var schema = mongoose.Schema({
		"username": String,
		"password": String
	});
	var ChatUser = db.model('ChatUser', schema);
	ChatUser.find(criteria, function(err, docs) {
		cb(!!docs.length);
	});
};

exports.module = http.createServer(function(req, res) {
	if( req.url.indexOf("api/setFriends/") != -1 ) {
		var people = req.url.match(/setFriends\/([^\/]+)\/([^\/]+)/);
		var user = people[1];
		var friend = people[2];
		
		setFriends(user, friend);
		res.end(JSON.stringify({user: user, friend: friend}));
	} else if( req.url.indexOf("api/getFriends/") != -1 ) {
		var people = req.url.match(/getFriends\/([^\/]+)/);
		var user = people[1];
		
		getFriends(user, function(err, docs) {
			res.end(JSON.stringify({user: user, friends: docs.map(function(doc){return doc.friend;})}));
		});
	} else if( req.url.indexOf("api/makeUser/") != -1 ) {
		var credits = req.url.match(/makeUser\/([^\/]+)\/([^\/]+)/);
		var user = credits[1];
		var password = credits[2];
		
		makeUser(user, password);
		res.end(JSON.stringify({user: user, password: password}));
	} else if( req.url.indexOf("api/checkLogin/") != -1 ) {
		var credits = req.url.match(/checkLogin\/([^\/]+)\/([^\/]+)/);
		var user = credits[1];
		var password = credits[2];
		
		checkLogin({username: user, password: password}, function(valid) {
			res.end(JSON.stringify({valid: valid}));
		});		
	} else if( req.url.indexOf("chat/") != -1 ) {
		var people = req.url.match(/chat\/([^\/]+)/);
		var user = people[1];
		
		var read = fs.createReadStream(__dirname+"/index.html");
		res.writeHead(200, {'Content-Type': 'text/html'});
		read.pipe(res);	
	} else if( req.url.match("\.css$") ) {
		var read = fs.createReadStream(__dirname+req.url);
		res.writeHead(200, {'Content-Type': 'text/css'});
		read.pipe(res);	
	} else {
		var read = fs.createReadStream(__dirname+"/home.html");
		res.writeHead(200, {'Content-Type': 'text/html'});
		read.pipe(res);
	}
});

var users = {};
io.sockets.on('connection', function (socket) {
	socket.on("login", function(data) {
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