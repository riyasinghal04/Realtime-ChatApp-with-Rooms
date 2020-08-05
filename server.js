  const path=require('path'); //path module
  const http=require('http');
  const express=require('express');
  const socketio=require('socket.io')//chat app
  const formatMessage=require('./utils/messages');
  const { userJoin, getCurrentUser, userLeave, getRoomUsers}= require('./utils/users');

  const app= express(); //initialising variable app to express
  const server = http.createServer(app);
  const io=socketio(server); //http server we are going to bind to

  //set static folder html css file 
  app.use(express.static(path.join(__dirname, 'public')));

  const botName= 'ChatBot';

  //run when a user connects 
  io.on('connection', socket=>{

    socket.on('joinRoom',({username, room})=>{
        const user=userJoin(socket.id,username, room)
        
        socket.join(user.room);

        //emits to single user connecting- to welcome current user
        socket.emit('message',formatMessage(botName,'Welcome to Chat Room!')); 
    
        //broadcast when a user connects- message sent to everyone besides the user connecting
        socket.to(user.room).broadcast.emit('message',formatMessage(botName,` ${user.username} has joined the ${user.room} room`));
        
        //send users to room
        io.to(user.room).emit('roomUsers',{
            room: user.room,
            users: getRoomUsers(user.room)
        });
    });

   
    //listen for chat message
    socket.on('chatMessage', msg=>{
       // console.log(msg);
       const user= getCurrentUser(socket.id);
        io.to(user.room).emit('message',formatMessage(user.username,msg));
    });

    
    //io.emit() - to all the clients including user. 
    //Runs when client disconnects
    socket.on('disconnect',()=>{
        const user = userLeave(socket.id);

        if(user){
            io.to(user.room).emit('message',formatMessage(botName,`${user.username} has left the chat`));
        
            //send users to room
            io.to(user.room).emit('roomUsers',{
            room: user.room,
            users: getRoomUsers(user.room)
        });
        }
    });
    
  });


  const PORT = 3000 || process.env.PORT;

  server.listen(PORT,()=>console.log(`server running on port ${PORT}`)); 