import { React, useEffect, useState } from "react";
import { Widget, addResponseMessage } from "react-chat-widget";
import "react-chat-widget/lib/styles.css";
import {
  chatPull,
  chatPush,
  chatCreate,
} from "./database_files/chatbox_chat.js";

// This module should be used with:
//     react version                     react@17.0.2
//     react-dom version                 react-dom@17.0.2
//     firebase version                  firebase@8.10.0

// getLobbyName()
// Returns the string that represents the name of the database directory
// that will be created for the lobby
function getLobbyName() {
  return "lobby007"; // Call to get lobby name from elsewhere
}

// generateUserName()
// Returns a random number in [0, 1000000) representing a user ID so the chatbox
// can distinguish one player from another
function generateUserName() {
  return String(Math.floor(Math.random() * 1000000));
}

// updateChatbox()
// Takes an updated chat history from the database as well as an object containing
// { the lobby name, user name of this player, and the index of most oldest message not yet printed to the chatbox }
//
// Prints all the messages currently in the database that aren't already displayed in the chatbox
function updateChatbox(chatArray, chatbox_attributes) {
  for (
    let i = chatbox_attributes.oldestMessageIndex;
    i < chatArray.length;
    i++
  ) {
    var message = chatArray[i];
    var splitArray = message.split(" ", 2);
    var sender = splitArray[0].slice(0, splitArray[0].length - 1);
    var text = message.slice(sender.length + 2, message.length);
    if (!(sender === chatbox_attributes.userName)) {
      addResponseMessage(text, chatbox_attributes.userName);
    }
  }
  chatbox_attributes.oldestMessageIndex = chatArray.length;
}

// pullChatFromDatabase()
// Takes an object containing
// { the lobby name, user name of this player, and the index of most oldest message not yet printed to the chatbox }
//
// Pulls the most up to date chat history from the database
function pullChatFromDatabase(chatbox_attributes) {
  var chat_promise = chatPull(chatbox_attributes.lobbyName);
  chat_promise.then(
    (result) => {
      updateChatbox(result, chatbox_attributes);
    },
    (err) => {
      console.log(err);
    }
  );
}

// Chatbox()
//
// React Component that implements the full functionality of a multi-user chat
function Chatbox() {
  // Create state variables for use in the chatbox_attributes object
  // lobbyName: the string representing the name of the database directory that the chat history will use
  // userName: the string representing the name of an individual player
  // oldestMessageIndex: the index of the oldest message in the database that hasn't yet been printed to the chatbox
  const [lobbyName, setLobbyName] = useState(getLobbyName()); // temporary
  const [userName, setUserName] = useState(generateUserName());
  const [oldestMessageIndex, setoldestMessageIndex] = useState(0);

  // Create object to be passed to chatbox functions
  const chatbox_attributes = {
    lobbyName: lobbyName,
    userName: userName,
    oldestMessageIndex: oldestMessageIndex,
  };

  // Create the database directory for the chat history
  chatCreate(lobbyName);

  // Pull the most recent chat history from the database every 128 milliseconds
  setInterval(pullChatFromDatabase, 128, chatbox_attributes);

  // When this user enters a message into the chatbox, take the string containing the message and push it to the database
  const handleNewUserMessage = (newMessage) => {
    chatPush(lobbyName, userName, newMessage);
  };

  // Chatbox component and its props to be rendered to the screen
  var chat = (
    <Widget
      handleNewUserMessage={handleNewUserMessage}
      title="Lobby Chat"
      subtitle=""
    />
  );
  return chat;
}

export default Chatbox;
