const socket = io();
let username;
let selectedRoom;

document.getElementById('create-room-btn').addEventListener('click', () => {
  const roomName = document.getElementById('room-name-input').value.trim();
  if (roomName) {
    socket.emit('createRoom', roomName);
  }
});

document.getElementById('send-btn').addEventListener('click', () => {
  const messageInput = document.getElementById('message-input');
  const message = messageInput.value.trim();
  if (message !== '') {
    socket.emit('message', { username, message, room: selectedRoom });
    messageInput.value = '';
  }
});

socket.on('roomList', rooms => {
  const roomListItems = document.getElementById('room-list-items');
  roomListItems.innerHTML = '';
  rooms.forEach(room => {
    const roomItem = document.createElement('li');
    roomItem.textContent = room;
    roomItem.addEventListener('click', () => joinRoom(room));
    roomListItems.appendChild(roomItem);
  });
});

socket.on('userList', users => {
  const userList = document.getElementById('user-list');
  userList.innerHTML = '<strong>Users:</strong> ' + users.join(', ');
});

socket.on('chatMessage', message => {
  const messagesContainer = document.getElementById('messages');
  const messageElement = document.createElement('div');
  messageElement.classList.add('message');

  const messageContent = document.createElement('div');
  messageContent.textContent = message.message;
  messageElement.appendChild(messageContent);

  const messageInfo = document.createElement('div');
  messageInfo.textContent = `${message.username} (${message.timestamp})`;
  messageInfo.classList.add('message-info');

  if (message.username === username) {
    messageElement.classList.add('sent-message');
    messageElement.appendChild(messageInfo);
  } else {
    messageElement.classList.add('received-message');
    messageElement.appendChild(messageInfo);
  }

  messagesContainer.appendChild(messageElement);
});

socket.on('userJoined', username => {
  const messagesContainer = document.getElementById('messages');
  const joinMessage = document.createElement('div');
  joinMessage.textContent = `${username} has joined the room.`;
  joinMessage.classList.add('join-message');
  messagesContainer.appendChild(joinMessage);
});

function joinRoom(room) {
  selectedRoom = room;
  document.getElementById('room-title').textContent = `Room: ${room}`;
  document.getElementById('chat-room').style.display = 'block';
  username = prompt('Enter your username:');
  if (username) {
    socket.emit('join', { username, room });
    document.getElementById('message-input').focus();
  }
}
