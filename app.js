var express = require('express');
var app = express();

var server = require('http').createServer(app);
var io = require('socket.io')(server);

app.use(express.static(__dirname+'/chatroom_client'));

server.listen(3000, function () {
  console.log('Socket IO server listening on port 3000');
});

var playerList = {};

io.on('connection', function(socket){
  socket.on('login', function(data){

    function chkNameDuplicated(name){
      for(var p in playerList)
        if(playerList[p].name == name)
          return true;
      return false;
    }

    if(chkNameDuplicated(data.name)){
      console.log("Name "+data.name+" duplicate");
      socket.emit('rejectName', null);
      return;
    }

    console.log("Client logged-in:\n name:"+data.name+"\n socket id: "+socket.id);

    socket.name = data.name;
    socket.broadcast.emit('login', data);

    for(var socketid in playerList){
      var playerData = playerList[socketid];
      socket.emit("login", {
        name: playerData.name,
        gender: playerData.gender,
        skinTone: playerData.skinTone,
        x: playerData.x,
        y: playerData.y,
        curFrame: playerData.curFrame,
        dir: playerData.dir
      });
    }
    playerList[socket.id] = data;
  });

  socket.on('move', function(data){
    socket.broadcast.emit('move', data);
  });

  socket.on('chat', function (data) {
    console.log('Messsage from '+ data.userid+' : '+data.chat);
    socket.broadcast.emit('chat', data);
  });

  socket.on('forceDisconnect', function () {
    socket.disconnect();
  });

  socket.on('disconnect', function () {
    console.log('user disconnected: '+socket.name);
    delete playerList[socket.userid];
    io.emit('logout', socket.userid);
  });
});