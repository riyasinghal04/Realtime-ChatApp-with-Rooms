//client side
const chatForm=document.getElementById('chat-form');
const chatMessages=document.querySelector('.chat-messages');
const  roomName=document.getElementById('room-name');
const userList=document.getElementById('users');

//get username and room from URL
const{username, room}=Qs.parse(location.search,{
    ignoreQueryPrefix: true
});
//console.log(username,room);

const socket=io();

//join chatroom
socket.emit('joinRoom',{username, room});

//get room and users
socket.on('roomUsers',({room, users})=>{
    outputRoomName(room);
    outputUsers(users);
});

//messages from server
socket.on('message',message=>{
    console.log(message);
    outputMessage(message);//function

    //every time you get a new message, it automatically scrolls down
    chatMessages.scrollTop=chatMessages.scrollHeight;
});

//message submit/sent
chatForm.addEventListener('submit',(e)=>{
    e.preventDefault();

    //get message text
    const msg=e.target.elements.msg.value;

    //emit message to server
    socket.emit('chatMessage',msg);

    //clear out the input
    e.target.elements.msg.value='';
    e.target.elements.msg.focus();
});


//output message to DOM
function outputMessage(message){
    //dom manipulation
    const div= document.createElement('div');
    div.classList.add('message'); //access the div having class='message'
    div.innerHTML= `<p class="meta">${message.username} <span>${message.time}</span></p>
    <p class="text">
       ${message.text}
    </p>`;

    //whenever we send a message, it will add the div to this chat messages class in the chat.html
    document.querySelector('.chat-messages').appendChild(div);
}

function outputRoomName(room){
    roomName.innerText=room;

}

function outputUsers(users){
    userList.innerHTML=`
    ${users.map(user=> `<li>${user.username}</li>`).join('')}
    `;

}