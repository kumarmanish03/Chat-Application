const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const forwardMessage = require('./utils/messages');
const {userJoin, getCurrentUser, userLeave, getRoomUsers} = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Static folder
app.use(express.static(path.join(__dirname, 'public')));

const chatBot = 'ChatCord Bot';

// Run when client connects
io.on('connection', (socket) => {
    console.log('New Web socket connected');

    socket.on('joinRoom', ({username, room}) => {

        const user = userJoin(socket.id, username, room);

        socket.join(user.room);
        
        // Welcome  current user
        socket.emit('message', forwardMessage(chatBot, 'Welcome to ChatChord'));
        
        // Broadcast when a user connects
        socket.broadcast.to(user.room).emit('message', forwardMessage(chatBot, `${user.username} has joined the chat!`));

        // Send users and room info
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        })
    })

    // Listen chat Messages
    socket.on('chatMessage', (msg) => {
        const user = getCurrentUser(socket.id);

        io.to(user.room).emit('message', forwardMessage(user.username, msg));
    })

    // Runs when client disconnects
    socket.on('disconnect', () => {
        const user = userLeave(socket.id);

        if(user){
            io.to(user.room).emit('message', forwardMessage(chatBot, `${user.username} has left the chat`));

            // Send users and room info
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            })

        }
    });
});

const PORT = 3000 || process.env.PORT;

server.listen(PORT, () => {
    console.log(`Server started on PORT: ${PORT}`);
})