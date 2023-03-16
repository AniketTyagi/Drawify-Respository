import { putData, getData } from "./database.js"

// This module should be used with firebaseConfig.js and database.js
// and they should be placed in the same directory
// Otherwise, you might need to modify the import path above

// All the functions below are async, so you should use 'await' when using them
// like "await chatCreate(lobbyName);"



// Create a directory in database to store data
// You should always use this first before using chatPull or chatPush
// The parameter 'lobby' should be a string that represents the name of the database directory you are creating
// You can give any name to 'lobby'
// Just make sure you input the same 'lobby' to chatPull and chatPush if you want to perform them on the same directory you just created
async function chatCreate(lobby) {
    await putData('chat/'+lobby, {"chatArray": [['Notification', 'Chat started']]});
    return;
}

// Pull the entire chat history in a 'lobby'/directory
// Output is a list of strings of the format '<user>: <message>'
async function chatPull(lobby) {
    const chatArray = await getData('chat/'+lobby+'/chatArray');
    var chat = []
    for (let i = 1; i < chatArray.length; i++) {
        chat.push(chatArray[i][0] + ': ' + chatArray[i][1]);
    }
    return chat;
}

// Push a message with the associated username to the database
// Both parameters, 'user' and 'msg', should be a string
async function chatPush(lobby, user, msg) {
    var {"chatArray": chatArray} = await getData('chat/'+lobby);
    chatArray.push([user, msg]);
    await putData('chat/'+lobby, {"chatArray": chatArray});
    return;
}

export { chatCreate, chatPull, chatPush };
