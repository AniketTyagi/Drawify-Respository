import { putData, getData } from "./database.js"

// This module should be used with firebaseConfig.js and database.js
// and they should be placed in the same directory
// Otherwise, you might need to modify the import path above

// All the functions below are async, so you should use 'await' when using them

//Creates a joinable game lobby in firebase realtime database
//Lobby name is the randomly generated 4 letter code from generateCode()
//returns lobby's join code

async function createLobby() {
    //generate 4 letter lobby code
    let lobbyCode = generateCode();
    let path = 'game_lobbies/' + lobbyCode;
    
    //create new lobby in database
    await putData(path , {"players": ['Host']});

    return lobbyCode;
}

//Adds "playerName" to a lobby's list of players using the lobby code
//code: lobby code/name
//playerName: name to be added to players list

async function joinLobby(code, playerName) {
    //retrieve the lobby's current list of players
    const lobbyData = await getData('/game_lobbies/' + code);
    const players = lobbyData.players;

    players.push(playerName);

    await putData('/game_lobbies/' + code + "/players", players);
}

//randomly generates 4 letter code for lobby name/join code
function generateCode() {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let lobbyCode = "";
    for (let i = 0; i < 4; i++) {
        lobbyCode += letters[Math.floor(Math.random() * letters.length)];
    } 

    return lobbyCode;
}

export { createLobby, joinLobby };
