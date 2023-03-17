/* If you're feeling fancy you can add interactivity 
    to your site with Javascript */

// Be sure to name any p5.js functions we use in the global so Glitch can recognize them.
// Add to this list as you consult the p5.js documentation for other functions.
/* global text, firebase, Game, createElement, whiteboard, createDiv, line, mousePressed, rotate, mouseReleased, firebaseConfig, keyReleased, noFill, pixels, keyCode, createCanvas, pmouseX, pmouseY, textSize, background, updatePixels, loadPixels, displayWidth, displayHeight, createButton, width, height, windowWidth, windowHeight, ellipse, mouseX, mouseY, fill, clear, rect, noStroke, createInput, stroke, strokeWeight */

// JS file to run html page
// Controls what shows up on page, and runs the voting aspect of the game

//Keeps track of what's loaded on page
var current_page = "lobby/game"


// Create board for rendering scored drawings during scoring page
var whiteboard_edge_x = 10;
var scoring_board;

// Create whiteboard object
function create_scoring_whiteboard() {
  var whiteboard_edge_x = 10;
  var whiteboard_edge_y = 10;
  scoring_board = new whiteboard([
    whiteboard_edge_x,
    whiteboard_edge_y,
    windowWidth - (2 * whiteboard_edge_x),
    windowHeight - (2 * whiteboard_edge_y)
  ]);
};

// Global variable to keep track of mouse clicks
var mouseClick = false;

// Global variable to keep track of space bar
var spaceClick = false;

// Create database variable
var database;

// Game object variable, this object will run the logic of the game itself. Defined in setup()
var game;

// Text input box for game page
var prompt_input;
var prompt_button;

//create and join lobby buttons for game page
var lobby_join_button;
var lobby_create_button;

// Define game page divs
var div;
var chat_div;
var chat_div_screen_padding;
var chat_div_width;
var player_list;
var chat_list;
var chat_input;
var div_screen_padding;
var div_width;
var chat_button;

// Define scoring page divs
var scoring_div;
var scoring_div_screen_padding
var scoring_div_width

// Variable that will hold scoring lobby data
var scoring_lobby;

// Define scoring page list elements
var scoring_page_elements = []

// Define array of all loaded drawings
var player_scoring_boards = [];

//p5.js setup function, ran once when the page is loaded

function setup() {
  
  //connect to the database
  database = firebase.database();
  
  //create p5.js canvas
  createCanvas(windowWidth, windowHeight);
  background(255);
  
  //Initialize game page
  game_page_init();
  
}

//p5.js Draw loop, runs at 60 FPS
//controls which page is loaded 
//Starts the main game loop

//controls the prompts for scoring pictures and prompts once scoring begins

function draw() {
  if(current_page == "lobby/game") {
    background(66, 44, 143);
    
    //Run main game loop
    game.main_loop();
    
    // Check whether the game has ended or not and if so, clear page and begin page transition
    if(game.current_phase == "scoring") {
      game_page_clear();
      scoring_page_init();
    }
    
  } else if(current_page == "scoring") {
    background(51, 211, 232);
    
    //Runs the whiteboards main loop so that it shows
    //scoring_board.main_loop();
    
    // Boolean to check if player is done scoring
    var done_scoring = true;
    
    // Loop through boards and display them
    for(let i = 0; i < player_scoring_boards.length; i++) {
      for(let j = 0; j < player_scoring_boards[i].length; j++) {
        // Render each player's drawings from the game
        //console.log(player_scoring_boards[i][0])
        let current_scoring_board = player_scoring_boards[i][j][3]
        let current_scoring_prompt = player_scoring_boards[i][j][2]
        let original_scoring_prompt = player_scoring_boards[i][j][1]
        let current_scoring_player = player_scoring_boards[i][j][0]
        
        // Calculate the next original prompt
        if((j + 1) < player_scoring_boards[i].length) {
          player_scoring_boards[(i+2) % player_scoring_boards.length][j + 1][1] = player_scoring_boards[i][j][1]
        }
        current_scoring_board.main_loop();
      
        // Add board interactivity but prevent drawing
        current_scoring_board.override = true;
      
        // Calculate whether player is hovering over drawing
        var player_in_bounds = false;
        if(mouseX > current_scoring_board.boundary[0] && mouseX < (current_scoring_board.boundary[0] + current_scoring_board.boundary[2]) && mouseY > current_scoring_board.boundary[1] && mouseY < (current_scoring_board.boundary[1] + current_scoring_board.boundary[3])) {
          player_in_bounds = true;
          fill(0)
          textSize(12)
          text(current_scoring_prompt, mouseX, mouseY)
        }
      
        // Check whether board has been scored already and if it hasn't then unmark grading boolean
        if(!player_scoring_boards[i][j][4]) {
          done_scoring = false;
        }
        
        // If mouse in bounds and mouse clicked, bring up the scoring prompt
        if(mouseClick && player_in_bounds && !player_scoring_boards[i][j][4]) {
          // Ask players to score the given image
          let original_prompt_string = `Please score from 1-5 on drawing accuracy to the ORIGINAL prompt :D!\nHere is the original prompt: ${player_scoring_boards[i][j][1]}`
          let original_prompt_score;
          let given_prompt_score;
          let given_prompt_string = `Please score from 1-5 on drawing accuracy to the GIVEN prompt :D!\nHere is the given prompt: ${player_scoring_boards[i][j][2]}`
          do {
            original_prompt_score = prompt(original_prompt_string);
          } while(original_prompt_score == null || original_prompt_score.match(/^[0-9]+$/) == null || original_prompt_score < 0 || original_prompt_score > 5);
          do {
            given_prompt_score = prompt(given_prompt_string);
          } while(given_prompt_score == null || given_prompt_score.match(/^[0-9]+$/) == null || given_prompt_score < 0 || given_prompt_score > 5);
          
          if(original_prompt_score != null && given_prompt_score != null) {
            // Tally and compile score to local player score profile
            game.player_final_scores[i] += (parseInt(original_prompt_score) + parseInt(given_prompt_score))
          
            // Update that we are finished scoring
            player_scoring_boards[i][j][4] = true;
          }
            
          mouseClick = false
        }
      }
    }
    
    // Check whether we are done scoring as the player and if so, push scoring changes to server
    if(done_scoring) {
      game.update_scores(game.player_final_scores);
    }
    
    // Check whether game winner has been decided and if so, switch pages
    if(game.game_winner != -1) {
      current_page = "lobby/game"
    }
    
    // Check whether the game scoring has ended or not and if so, clear page and begin page transition
    if(current_page == "lobby/game") {
      scoring_page_clear();
      game_page_init();
    }
  }
}

// Function to submit prompt/drawings by the players
function submit_input() {
  const prompt = prompt_input.value();
  prompt_input.value('');
  
  // Depending the phase of the game, we either send the player's prompt or their drawing
  if(game.current_phase == "initial_prompt") {
    
    game.update_prompt(prompt)
  } else if(game.current_phase == "drawing") {
    game.update_board(game.player_board.export())
  }
}


// Function to send chat messages by players
function submit_chat() {
  const chat = chat_input.value();
  if(chat != '') {
    chat_input.value('');
  
    game.send_message(chat);
  }
}

// Function called when player presses "Create Game" button
// Gets inputs and runs game.createRoom when ready

function create_game() {
  let numPlayers;
  //Get number of players for the lobby to start
  do {
    numPlayers = prompt("Enter Number of Players");
    mouseClick = false
  } while(numPlayers.match(/^[0-9]+$/) == null) 
  let player_username = prompt("Enter your username");
  mouseClick = false
  
  // Set username and join room
  if(player_username != null && numPlayers != null) {
    game.createRoom(numPlayers, player_username) //change these to be proper parameters
  
    //clean up buttons
    if(game.current_phase != "no_game") {
       lobby_join_button.remove() 
      lobby_create_button.remove()
    }
  }
  
}

function join_game(){
  let code = "";
  mouseClick = false
  do {
    code = prompt("Enter 4 letter lobby code");
    mouseClick = false
  } while(code.length != 4);
  let player_username = prompt("Enter your username");
  
  
  if(code != null && player_username != null) {
  // Set username and join room
  let result = game.joinRoom(code, player_username);
  
  //remove buttons (if successful)
   if(result == 0) {
       lobby_join_button.remove() 
      lobby_create_button.remove()  
    }
  }
}

// Generate array to hold all boards, prompts, scoring, etc...
function drawBoards(lobby){
  
  
  
  console.log(lobby)
  
  console.log(lobby.players.length)
  
  // Calculate x and y coordnates of big scoring board
  var board_root_x = scoring_board.boundary[0]
  var board_root_y = scoring_board.boundary[1]
  var board_width = scoring_board.boundary[2] / lobby.players.length
  var board_height = scoring_board.boundary[3] / lobby.players.length
  
  // Initialize player final scores as empty array
  game.player_final_scores = [];
  
  for(let people = 0; people < lobby.players.length; people++) { 
    console.log(people)
    
    game.player_final_scores.push(0)
    
    let currentPlayer = lobby.players[people];
    
    player_scoring_boards[people] = []
    
    for(let p = 1; p < currentPlayer.previous_boards.length; p++) {
      
      let boardJSON = currentPlayer.previous_boards[p]
      
      //create_scoring_whiteboard();
      
      // Define boundaries for all displayed drawings
      var new_player_boundary = [
        board_root_x + board_width * (p - 1), 
        board_root_y + board_height * people, 
        board_width, 
        board_height
      ];
      
      // Create new player drawing whiteboards
      var new_player_board = new whiteboard(new_player_boundary)
      new_player_board.import(boardJSON)
      
      // Push all player drawings from database into single array
      // [player_username, original prompt associated with board, prompt associated with board, the actual board]
      player_scoring_boards[people].push([currentPlayer.username, currentPlayer.previous_prompts[1], currentPlayer.previous_prompts[p], new_player_board, false])
      
      
   
      
      //console.log(lobby.players[people].previous_prompts[p])
    }
  }
  
  
}

function getHistory(lobby) {
  
    var thread = []

    var output = []
    var playerHistory = []
    var index = 0
    for (var player = 0; player < lobby.players.length; player++) {
        var currPlayer = player
        var prompt = ''
        for (var round = 1; round < (lobby.players.length + 1); round++) {
          
            currPlayer = (player + (2 * (round - 1))) % lobby.players.length
          
            
            
            //getData(path+(currPlayer.toString())+'/previous_prompts/'+(round.toString()))
            //DRAWING OR PROMPT ROUND
          
            prompt = lobby.players[currPlayer].previous_prompts[round]
          
            playerHistory.push(prompt)
        }
      
        output.push(playerHistory)
        playerHistory = []
    }

  
  //unessesarry
    var outputString = ''
    for (var i = 0; i < output.length; i++) {
        var curr = output[i]
        for (var j = 0; j < curr.length; j++) {
            outputString += curr[j]
            if (j != (curr.length - 1)) {
                outputString += ' -> '
            }
        }
        if (i != (output.length - 1)) {
            outputString += '\n'
        }
    }
    console.log(outputString);
  }



// Function to initialize scoring page HTML elements
function scoring_page_clear() {
  //
}

// Function to scoring page HTML elements
function scoring_page_init() {
  // Clear whiteboard and switch to scoring whitepage
  create_scoring_whiteboard();  
  current_page = 'scoring';
  
  // Get final values
  game.dbRootRef.once("value")
    .then(function(snapshot) {
    
    scoring_lobby = snapshot.val()
    drawBoards(scoring_lobby);
    getHistory(scoring_lobby);
  });
}

// Function to remove game page HTML elements
function game_page_clear() {
  prompt_input.remove();
  prompt_button.remove();
  chat_div.remove();
  chat_list.remove();
  chat_button.remove();
  chat_input.remove();
  
  if(lobby_join_button) {
     lobby_join_button.remove() 
  }
  
  if(lobby_create_button) {
    lobby_create_button.remove()
  }
}


// Function to intialize game page HTML elements
function game_page_init() {
  //game object initialized
  game = new Game(database);
  
  // Create text input box for prompt responses
  var prompt_padding = 10;
  prompt_input = createInput();
  prompt_input.position(game.player_board.boundary[0], game.player_board.boundary[1] + game.player_board.boundary[3] + prompt_padding);
  prompt_input.size(3 / 4 * game.player_board.boundary[2], windowHeight - (game.player_board.boundary[1] + game.player_board.boundary[3]) - (2 * prompt_padding))
  prompt_input.style('border-radius', '25px')
  prompt_input.style('font-size', '25px')
  
  // Create text input button for prompt responses
  prompt_button = createButton('submit');
  prompt_button.position(prompt_input.x + prompt_input.width, game.player_board.boundary[1] + game.player_board.boundary[3] + prompt_padding);
  prompt_button.size(1 / 4 * game.player_board.boundary[2], windowHeight - (game.player_board.boundary[1] + game.player_board.boundary[3]) - (2 * prompt_padding))
  prompt_button.mousePressed(submit_input);
  prompt_button.style('border-radius', '25px')
  prompt_button.style('font-size', '25px')
  
  // Create Chat Div
  chat_div = createDiv();
  chat_div_screen_padding = 10;
  chat_div_width = windowWidth - (game.player_board.boundary[0] + game.player_board.boundary[2]) - 2 * chat_div_screen_padding;
  chat_div.style('font-size', '16px');
  chat_div.style('color', '#000000');
  chat_div.style('height', game.player_board.boundary[3] + 'px')
  chat_div.style('width', chat_div_width + 'px')
  chat_div.style('background-color', '#ffffff')
  chat_div.style('overflow-y', 'auto')
  chat_div.style('overflow-x', 'auto')
  //chat_div.style('padding-left', '10px')
  chat_div.position(game.player_board.boundary[0] + game.player_board.boundary[2] + chat_div_screen_padding, game.player_board.boundary[1]);
  chat_div.id('player_chat')
  
  // Create ordered list for chat status div
  chat_list = createElement('ol');
  chat_list.style('list-style-type', 'none')
  chat_list.parent('player_chat')
  chat_list.id('chat_list')
  
  // Create text input box for chat
  var chat_padding = 10;
  var chat_x = game.player_board.boundary[0] + game.player_board.boundary[2] + chat_div_screen_padding
  var chat_y = game.player_board.boundary[1] + game.player_board.boundary[3] + chat_padding
  var chat_width = 4 / 6 * (chat_div_width);
  var chat_height = windowHeight - (game.player_board.boundary[1] + game.player_board.boundary[3]) - (2 * prompt_padding);
  chat_input = createInput();
  chat_input.position(chat_x, chat_y);
  chat_input.size(chat_width, chat_height)
  chat_input.style('border-radius', '25px')
  chat_input.style('font-size', '25px')
  
  // Create text input button for messages
  chat_button = createButton('send');
  chat_button.position(chat_x + chat_width + chat_padding, chat_y);
  chat_button.size(chat_div_width - chat_width, chat_height)
  chat_button.mousePressed(submit_chat);
  chat_button.style('border-radius', '25px')
  chat_button.style('font-size', '25px')
  
  //Join Lobby Button
  lobby_create_button = createButton('Make New Lobby');
  lobby_create_button.position((game.player_board.boundary[0] + game.player_board.boundary[2])/2, (game.player_board.boundary[1] + game.player_board.boundary[3])/2 - 100);
  lobby_create_button.size(1 / 4 * game.player_board.boundary[2], game.player_board.boundary[1]);
  lobby_create_button.mousePressed(create_game);
  mouseClick = false
  
  //Join Lobby Button
  lobby_join_button = createButton('Join Existing Lobby');
  lobby_join_button.position((game.player_board.boundary[0] + game.player_board.boundary[2])/2, (game.player_board.boundary[1] + game.player_board.boundary[3])/2 + 100);
  lobby_join_button.size(1 / 4 * game.player_board.boundary[2], game.player_board.boundary[1]);
  lobby_join_button.mousePressed(join_game);
  mouseClick = false
}

function mousePressed() {
  mouseClick = true;
}

function mouseReleased() {
  mouseClick = false;
}

function keyPressed() {
  if(keyCode == 32) {
    spaceClick = true;
  }
}

function keyReleased() {
  if(keyCode == 32) {
    spaceClick = false;
  }
}

//TESTING FUNCTION
/*
* If testing lobby doesnt exits, creates it
* (You will have to play through at least one game to create the data for the testing lobby)
* If lobby does exist, it will join and game will have access to test data
*/
function testGame() {
  

  if(lobby_join_button) {
     lobby_join_button.remove() 
  }
  
  if(lobby_create_button) {
    lobby_create_button.remove()
  }
  
  const dbRef = game.database.ref();
    dbRef
      .child("gameLobbies")
      .child('TEST')
      .get()
      .then((snapshot) => {
        if (snapshot.exists()) {
          game.joinTestRoom();
        } else {
          game.createTestRoom();
        }
  //game.createTestRoom()
  //game.joinRoom("TEST", )
    console.log(dbRef)
  
  })
            
}