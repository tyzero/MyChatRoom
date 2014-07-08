var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

app.use('/', express.static(__dirname + '/www'));
 
var users = {
	fanglin:{
		socket:null,
		online:false
	},
	lizilin:{
		socket:null,
		online:false
	},
	xiaofang:{
		socket:null,
		online:false
	},
	kehan:{
		socket:null,
		online:false
	}
};

function getOnlineUsers(){
	var online = [], i;
	for(i in users){
		if(users[i].online === true){
			online.push(i);
		}
	}
	
	return online;
};

io.on('connection', function(socket){
	socket.on('new message',function(data){
		var i,user;
		if(data.broadcast===true){
			socket.broadcast.emit('new message',{fromUser:data.fromUser,msg:data.msg});
		}else{
			for(i=0;i<data.tousers.length;i++){
				user = users[data.tousers[i]];
				if(user.online==true && user.socket!=null){
					user.socket.emit('new message',{fromUser:data.fromUser,msg:data.msg});
				}
			}
		}
	});
	
	socket.on('login',function(data){
		if(data.username in users){
			users[data.username].online = true;
			users[data.username].socket = socket;
			socket.emit('login success',{username:data.username,allusers:getOnlineUsers()});
			socket.broadcast.emit('enter chat',{username:data.username,allusers:getOnlineUsers()});
		}else{
			socket.emit('login failed');
		}
	});
	
	socket.on('disconnect',function(){
		var user;
		for (user in users){
			if(users[user].socket == socket){
				users[user].online = false;
				socket.broadcast.emit('leave chat',{username:user,allusers:getOnlineUsers()});
				return;
			}
		}
	});
});

server.listen(8080);
console.log('server is listenering on port 8080');