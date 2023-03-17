import { chatCreate, chatPull, chatPush } from "./chat.js"

// should be used with chat.js, database.js and firebaseConfig.js

// This script tests the basic database support for chat
// It inserts two messages from two users in the same lobby into the database
// Then it retrieves chat history and prints it out
// Output should be: 'Alice: Hey\nBob: Hello'

const lobby = 'test_lobby';
const user1 = 'Alice';
const user2 = 'Bob';
const msg1 = 'Hey'
const msg2 = 'Hello'

function printChat(arr) {
    for (let i = 0; i < arr.length; i++) {
        console.log(arr[i])
    }
    return;
}

await chatCreate(lobby);
var data = await chatPull(lobby);
//printChat(data);

await chatPush(lobby, user1, msg1);
data = await chatPull(lobby);
//printChat(data);

await chatPush(lobby, user2, msg2);
data = await chatPull(lobby);
printChat(data);

process.exit(0);
