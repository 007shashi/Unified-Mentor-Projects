const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

let users = [];
let rooms = [];

app.use(express.static('public'));

io.on('connection', socket => {
  console.log('A user connected.');

  socket.emit('roomList', rooms);

  socket.on('createRoom', roomName => {
    rooms.push(roomName);
    io.emit('roomList', rooms);
  });

  socket.on('join', ({ username, room }) => {
    socket.username = username;
    socket.room = room;
    users.push({ username, room });
    socket.join(room);
    io.to(room).emit('userList', getUsersInRoom(room));
  });

  socket.on('message', ({ username, message, room }) => {
    io.to(room).emit('chatMessage', {
      username,
      message,
      timestamp: new Date().toLocaleString()
    });
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected.');
    users = users.filter(user => user.username !== socket.username);
    if (socket.room) {
      io.to(socket.room).emit('userList', getUsersInRoom(socket.room));
    }
  });

  function getUsersInRoom(room) {
    return users.filter(user => user.room === room).map(user => user.username);
  }
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
