var http = require("http");
var express = require("express"),
    app = express(),
    socket = require('socket.io'),
    server = http.createServer(app),
    io = socket.listen(server),
    users = [];
app.use('/',express.static(__dirname + '/www')); //指定静态html文件位置
server.listen(8080);

//socket部分
io.on('connection', function(socket) { 
    // socket表示的是当前连接到服务器的那个客户端,所以代码socket.emit("login")则只有该客户端收得到这个事件，
    // 而socket.broadcast.emit("login")则表示向除该客户端外的所有人发送该事件
    // io表示服务器整个socket连接，所以代码io.sockets.emit("login")表示所有人都可以收到该事件
    //接收并处理客户端发送的foo事件
    socket.on("login",function(nickname){
        if(users.indexOf(nickname) > -1){
            socket.emit("nickExisted");
        }else{
            socket.userIndex = users.length;
            socket.nickname = nickname;
            users.push(nickname);
            socket.emit("loginSuccess");
            io.sockets.emit("system",nickname,users.length,"login"); //向所有连接到服务器的客户端发送当前登陆用户的昵称 
        }
    });
    socket.on('sendMsg',function(msg,color){
        socket.broadcast.emit("msg",socket.nickname,msg,color);
    });
    socket.on('img',function(imgUrl){
        socket.broadcast.emit("webimg",socket.nickname,imgUrl)
    });
    socket.on('video',function(imgUrl){
        socket.broadcast.emit("webVideo",socket.nickname,imgUrl)
    });
    socket.on("disconnect",function(){
        if(!socket.nickname)return;  
        users.splice(socket.userIndex, 1); //将断开连接的用户从users中删除
        socket.broadcast.emit('system', socket.nickname, users.length, 'logout'); 
    });
    socket.on("shake",function(){ //抖动
        socket.broadcast.emit("webShake",socket.nickname);
    })
});
console.log("server start");
