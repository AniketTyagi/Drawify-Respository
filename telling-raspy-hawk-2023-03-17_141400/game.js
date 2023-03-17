/* global tokenHoverAudio, whiteboard, createElement, createDiv, tokenBuildAudio, tokenConquerAudio, tokenScoreAudio, Howl, loadSound, triangle, color, beginShape, endShape, vertex, GameBoard, PoissonDisc, text, line, noFill, p5,Delaunator,  random, createVector, firebase, textAlign, keyCode, CENTER, mousePressed, mouseReleased, createCanvas, createSlider, textSize, background, displayWidth, displayHeight, createButton, width, height, windowWidth, windowHeight, ellipse, mouseX, mouseY, fill, clear, rect, noStroke, createInput, stroke, strokeWeight */

function Game(db) {
  
  // Initialize and create the whiteboard object
  var whiteboard_edge_x = 10;
  this.player_board = new whiteboard([
      whiteboard_edge_x,
      windowHeight / 10,
      (6 / 8) * windowWidth - whiteboard_edge_x,
      windowHeight - (2 / 10) * windowHeight
    ]);

  // Create whiteboard object
  this.create_whiteboard = function () {
    var whiteboard_edge_x = 10;
    this.player_board = new whiteboard([
      whiteboard_edge_x,
      windowHeight / 10,
      (6 / 8) * windowWidth - whiteboard_edge_x,
      windowHeight - (2 / 10) * windowHeight
    ]);
  };
  
  // Create virtual whiteboard
  this.create_whiteboard();

  // Keep track whether board was cleared after initial database change
  this.board_clear = false;
  
  // Keep track of which round we are one
  this.current_round = -1;
  
  // Keep track of who won the game
  this.game_winner = -1;
  
  // Initialize database variable
  this.database = db;
  // Current game room variable
  this.current_game_room;
  // Player ID value
  this.player_ID = -1;
  // Player Username
  this.player_username = "player" + this.player_ID;
  // Keep track of current game phase
  this.current_phase = "no_game";
  // Database reference to game root node
  this.dbRootRef = firebase
    .database()
    .ref("gameLobbies/" + this.currentGameRoom);

  // Keep track of current player prompt
  this.current_prompt = "";

  // Final scoring array for the player when the game has been completed
  this.player_final_scores = 0;
  
  // Keep track of the recieved prompt
  this.received_prompt = "";

  // Keep track of all player data
  this.player_data = [];

  // HTML Elements for status rendering
  this.player_status_elements = [];

  // Keep track of lobby joining
  this.current_occupied = [];

  // Keep track of current chat array
  this.player_chat = [];

  // Chat length hack
  this.chat_length = 0;

  // Keep track of chat HTML elements
  this.chat_html_elements = [];

  // JSON object that describes players during the game
  this.player_profile = function () {
    this.data = {
      username: "",
      current_prompt_ready: false,
      current_prompt: "",
      first_prompt: '',
      initial_board_clear: false,
      current_board_ready: false,
      current_board: -1,
      previous_prompts: [-1],
      previous_boards: [-1], 
      scoring_array: [-1], 
      scoring_ready: false
    };
  };

  // Main render function for the game
  this.main_loop = function () {
    // Render the whiteboard
    this.player_board.main_loop();

    // Render the upper text prompt
    textSize(60);
    fill(255);
    strokeWeight(1);
    if (this.current_phase == "no_game") {
      
      text("Please join or start a game :D", 10, 60);
      this.player_board.override = true;
      
    } else if (this.current_phase == "lobby_waiting") {
      this.player_board.override = true;
      text(`Waiting for game to start: Lobby code: ${this.current_game_room}`, 10, 60);
      
    } else if (this.current_phase == "initial_prompt") {
      
      // Set board override to true, so you can't draw
      this.player_board.override = true;
      if (!this.player_data[this.player_ID].current_prompt_ready) {
        
        text("Please enter a prompt below :)!", 10, 60);
      } else {
        text("Thank you for your prompt! Waiting for other players...", 10, 60);
      }
    } else if (this.current_phase == "drawing") {
      // Set board override to false, so you can draw
      this.player_board.override = false;
      if (!this.player_data[this.player_ID].current_board_ready) {
        text("Prompt to Draw For: " + this.received_prompt, 10, 60);
      } else {
        text("Thank you for your drawing! Waitin for other players...", 10, 60);
      }
    } else if (this.current_phase == "scoring"){
      
      //handled in script.js
    }

    // Render player status div
    // Create div for player status
  };

  // Send a player's message to the server
  this.send_message = function (message) {
    if (this.player_ID != -1) {
      // Change the current prompt
      this.player_chat.push(this.player_username + ": " + message);
      this.database
        .ref("gameLobbies/" + this.current_game_room + "/player_chat")
        .set(this.player_chat);
    }
  };

  // Push HTML elements based on chat
  this.update_chat = function (chat) {
    if (this.player_ID != -1) {
      var current_chat_length = chat.length;
      if (current_chat_length > this.chat_length) {
        // Find how many messages have been missed
        var message_amount = current_chat_length - this.chat_length
        
        // Loop through lost messages and locally push them to our chat
        for(var i = this.chat_length; i < this.chat_length + message_amount; i++) {
          // Define list HTML element for chat message
          var player_message = createElement("li");
          player_message.parent("chat_list");
          player_message.style('margin-top', '10px');
          player_message.id("message" + this.chat_length)
        
          // Create DIV around list message for CSS styling
          var actual_message = createElement("div", chat[i]);
          actual_message.style('background-color', '#d4d4d4');
          actual_message.style('border-radius', '5px');
          actual_message.parent("message" + this.chat_length);
        }
            
        // Update chat length
        this.chat_length = current_chat_length;
      }
    }
  };

  // Update a player's scores on the server
  this.update_scores = function(scores) {
    let path = "gameLobbies/" + this.current_game_room + "/players/" + this.player_ID
    if (this.player_ID != -1) {
      // Change the current prompt
      this.database
        .ref(path + "/scoring_array").set(scores);

      // Update prompt completion
      this.database
        .ref(path + "/scoring_ready").set(true);
    }
  }
  
  // Update a player's prompt on the server
  this.update_prompt = function (prompt) {
    let path = "gameLobbies/" + this.current_game_room + "/players/" + this.player_ID
    if (this.player_ID != -1) {
      // Change the current prompt
      this.database.ref(path + "/current_prompt").set(prompt);

      // Redundancy to ensure correct player username
      this.database.ref(path + "/username").set(this.player_username);
      
      //set first prompt if this is the first prompt
      // If the current round is equal to the number of players, we are on the first round
      if(this.current_round == this.current_occupied.length) {
        this.database
          .ref(path + "/first_prompt").set(prompt);
      }
      
      // Update prompt completion
      this.database
        .ref(path + "/current_prompt_ready").set(true);
    }
  };

  // Update a player's board on the server
  this.update_board = function (board) {
    let path = "gameLobbies/" + this.current_game_room + "/players/" + this.player_ID
    if (this.player_ID != -1) {
      // Change the current prompt
      this.database.ref(path + "/current_board").set(board);

      // Update prompt completion
      this.database
        .ref(path + "/current_board_ready").set(true);
    }
  };

  // Acts as the host's listener to the database
  // All changes on the database are processed by the host, which would be within this function
  this.host_listener = function () {
    // Attach listeners to mark for when a new turn starts for the player
    this.dbRootRef.on("value", (snapshot) => {
      const data = snapshot.val();
      this.current_phase = data.current_phase;
      this.current_occupied = data.occupied;
      this.player_data = data.players;
      this.player_chat = data.player_chat;
      this.current_round = data.current_round
      this.game_winner = data.game_winner
      if (this.player_ID != -1) {
        // Update player chat
        this.update_chat(this.player_chat);

        console.log(this.player_data);

        // Check whether the game has started
        if (data.current_phase == "lobby_waiting") {
          // Check if all players have entered the lobby
          var game_started = true;
          for (var i = 0; i < this.current_occupied.length; i++) {
            if (this.current_occupied[i] == false) {
              game_started = false;
              break;
            }
          }

          // Change game state if everybody's in the lobby
          if (game_started) {
            console.log("The game has started!!! WOOHOO");
            this.current_phase = "initial_prompt";

            // Change current game phase
            this.database
              .ref("gameLobbies/" + this.current_game_room + "/current_phase")
              .set(this.current_phase);
          }
        } else if (data.current_phase == "initial_prompt") {
          // Clear whiteboard only if not cleared before
          this.board_clear = false;

          // Get the latest swapped board from server
          if (data.players[this.player_ID].current_board != -1) {
            this.player_board.import(
              data.players[this.player_ID].current_board
            );
          }

          // Check whether all players have submitted a prompt or not and if they have, change to next cycle
          var prompts_completed = true;
          for (var i = 0; i < data.players.length; i++) {
            if (!data.players[i].current_prompt_ready) {
              prompts_completed = false;
              break;
            }
          }

          // Change game state if everybody has submitted a prompt and start swapping prompts over
          if (prompts_completed) {
            console.log("Everybody finished writing!!!");
            this.current_phase = "drawing";

            // Clear whiteboard
            this.create_whiteboard();
            
            
            // Copy and update player data
            var new_players = [];
            
            // Iterate through player data and push all player values
            for(var i = 0; i < data.players.length; i++) {
              new_players[i] = data.players[i];
              console.log("Here is the player data for player " + i + ": " + new_players[i])
            }

            // Store replacement prompts
            var replace_prompt = new_players[0].current_prompt;
            for (var i = 1; i < new_players.length; i++) {
              var swap_prompt = new_players[i].current_prompt;
              new_players[i].current_prompt = replace_prompt;
              replace_prompt = swap_prompt;
            }
            new_players[0].current_prompt = replace_prompt;
            
            // Update prompt history
            for (var i = 0; i < data.players.length; i++) {
              //new_players[i] = data.players[i];
              
              new_players[i].previous_prompts.push(new_players[i].current_prompt);
              // Reset prompts for next phase
              new_players[i].current_prompt_ready = false;
              new_players[i].initial_board_clear = false;
            }

            // Update game
            var data_copy = data;
            data_copy.players = new_players;
            data_copy.current_phase = this.current_phase;

            // Change the current game phase and all corresponding game data
            this.database
              .ref("gameLobbies/" + this.current_game_room)
              .set(data_copy);
          }
        } else if (data.current_phase == "drawing") {
          // Get the recieved prompt
          this.received_prompt = data.players[this.player_ID].current_prompt;

          if(!this.board_clear) {
            this.player_board.clear_board();
            this.board_clear = true;
          }
          
          // Check whether all players are done drawing
          var drawings_completed = true;
          for (var i = 0; i < data.players.length; i++) {
            if (!data.players[i].current_board_ready) {
              drawings_completed = false;
              break;
            }
          }

          // Change game state if everyone is done drawing
          if (drawings_completed) {
            console.log("Everybody finished drawing!!!");
            this.current_phase = "initial_prompt";

            // Copy and update player data
            var new_players = [];
            for (var i = 0; i < data.players.length; i++) {
              new_players[i] = data.players[i];
              // Update previous boards
              new_players[i].previous_boards.push(new_players[i].current_board);
              // Reset boards for next phase
              new_players[i].current_board_ready = false;
            }

            // Store replacement boards
            var replace_board = new_players[0].current_board;
            for (var i = 1; i < new_players.length; i++) {
              var swap_board = new_players[i].current_board;
              new_players[i].current_board = replace_board;
              replace_board = swap_board;
            }
            new_players[0].current_board = replace_board;

            // Update game
            var data_copy = data;
            data_copy.players = new_players;
            data_copy.current_phase = this.current_phase;

            // Since a drawing phase has finished that's 1 round, so reduce the round
            data_copy.current_round -= 1;

            // Check whether rounds have finished and if so, switch next mode to the scoring mode
            if (data_copy.current_round == 0) {
              data_copy.current_phase = "scoring";
            }

            // Change the current game phase and all corresponding game data
            this.database
              .ref("gameLobbies/" + this.current_game_room)
              .set(data_copy);
          }
        } else if (data.current_phase == "scoring") {
          // Add page code for scoring here
          console.log("THE GAME IS OVERRRR, WE SCORING NOW WOOT WOOT!");
          
          // Check whether game winner was decided
          if(this.game_winner != -1) {
            alert("OMG, THE GAME IS OVER AND PLAYER " + this.game_winner + " HAS WON!!!!!")
          }
          
          // Check whether all players are done scoring
          var scoring_completed = true;
          for (var i = 0; i < data.players.length; i++) {
            if (!data.players[i].scoring_ready) {
              scoring_completed = false;
              break;
            }
          }
          
          if(scoring_completed) {
            // Create a 0 array of scores and then add on to them as we process player scores
            var final_scores = []
            for(var i = 0; i < data.players.length; i++) {
              final_scores[i] = 0;
            }
            
            // Loop through player scores and start adding
            for(var i = 0; i < data.players.length; i++) {
              for(var j = 0; j < data.players[i].scoring_array.length; j++) {
                final_scores[j] += data.players[i].scoring_array[j];
              }
            }
            
            // Calculate who won the game
            var game_winner = 0;
            var winner_score = final_scores[0]
            for(var i = 0; i < data.players.length; i++) {
              if(final_scores[i] == winner_score) {
                winner_score += 1;
              }
              if(final_scores[i] > winner_score) {
                winner_score = final_scores[i];
                game_winner = i;
              }
            }
            
            // Copy data to update changes
            var data_copy = data;
            
            // Calculate joint winner string
            data_copy.game_winner = game_winner
            
            // Push to server who won the game
            this.database
              .ref("gameLobbies/" + this.current_game_room)
              .set(data_copy);
          }
        }
      }
    });
  };
  
  

  // Acts as the player's listener to the database
  // All changes on the database processed by the player would happen in this function
  this.player_listener = function () {
    this.dbRootRef.on("value", (snapshot) => {
      const data = snapshot.val();
      this.current_phase = data.current_phase;
      this.current_occupied = data.occupied;
      this.player_data = data.players;
      this.player_chat = data.player_chat;
      this.current_round = data.current_round
      this.game_winner = data.game_winner
      if (this.player_ID != -1) {
        // Update player chat
        this.update_chat(this.player_chat);

        if (this.current_phase == "initial_prompt") {
          this.board_clear = false;
          // Get the latest swapped board from server
          if (data.players[this.player_ID].current_board != -1) {
            this.player_board.import(
              data.players[this.player_ID].current_board
            );
          }
        } else if (this.current_phase == "drawing") {
          // Only clear the white board if board not cleared yet
          if(!this.board_clear) {
            this.player_board.clear_board();
            this.board_clear = true;
          }
          // Get the new prompt
          this.received_prompt = data.players[this.player_ID].current_prompt;
        } else if (this.current_phase == "scoring") {
          // Scoring listener for player
          if(this.game_winner != -1) {
            alert("OMG, THE GAME IS OVER AND PLAYER " + this.game_winner + " HAS WON!!!!!")
          }
        }
      }
    });
  };
  
  

  // Join online game if available and if not create one instead
  // Only the player, listener, manager, and called would occur in here
  this.joinRoom = function (game_room_ID, player_username) {
    // Check if a room exists with the given name
    const dbRef = this.database.ref();
    dbRef
      .child("gameLobbies")
      .child(game_room_ID)
      .get()
      .then((snapshot) => {
        if (snapshot.exists()) {
          // Take a snapshot of the current empty board state
          // Game initialization function call
          //this.initialize()
          var gameJSON = snapshot.val();
          this.current_phase = gameJSON.current_phase;
          this.player_ID = -1;
          this.current_game_room = game_room_ID;
          this.dbRootRef = firebase
            .database()
            .ref("gameLobbies/" + this.current_game_room);

          // Attach listeners to mark for when a new turn starts for the player
          this.player_listener();
          
          // Only join game if room is unnoccupied
          this.current_occupied = gameJSON.occupied;
          var open_slot_ID = -1;
          for (var i = 0; i < this.current_occupied.length; i++) {
            if (this.current_occupied[i] == false) {
              open_slot_ID = i;
              this.current_occupied[i] = true;
              break;
            }
          }
          
            // Check whether an open game slot was succesfully obtained
            if (open_slot_ID != -1) {
              this.player_ID = open_slot_ID;
            }
          
          // Update player username
          this.player_username = player_username

          // Post current board object
          console.log(snapshot.val());
          // Indicate room has now occupied a slot
          this.database
            .ref("gameLobbies/" + game_room_ID + "/occupied")
            .set(this.current_occupied);
          
          // Set player username data
          this.database
            .ref("gameLobbies/" + game_room_ID + "/players/" + this.player_ID + "/username")
            .set(this.player_username);
          
          // Send join message
          this.send_message("Just joined the game :D")
        }
      })
      .catch((error) => {
        console.error(error);
        return 1;
      });
    return 0;
  };

  // Function to create an online game of your own
  // Only the host-listener, manager, and calls would occur in here
  //this.createRoom = function (game_room_ID, player_numbers, rounds) {
  this.createRoom = function (player_numbers, player_username) {
    
    //generate the code for the lobby
    var game_room_ID = this.generateCode();
    //rare case where id = test
    if(game_room_ID == "TEST"){
      game_room_ID = this.generate_code();
    }
    
    // Initialize database reference and game_room_ID
    this.dbRootRef = firebase.database().ref('gameLobbies/' + game_room_ID);
    this.current_game_room = game_room_ID;

    // Attach and create host listener here
    this.host_listener();

    // Initialize game variables
    this.player_ID = 0;
    this.current_phase = "lobby_waiting";

    // Contains how many players will be in the game and whether they've joined
    this.current_occupied = [true];
    for (var i = 0; i < player_numbers - 1; i++) {
      this.current_occupied.push(false);
    }

    // This section contains the JSON format for describing the features of a game room
    console.log("Room created!");

    // Create each player game history profile
    var player_array = [];
    for (var i = 0; i < player_numbers; i++) {
      var new_player = new this.player_profile();
      new_player.data.username = "player" + i;
      
      // Create 0 scoring array
      var new_scoring_array = []
      for(var j = 0; j < player_numbers; j++) {
        new_scoring_array[j] = 0;
      }
      
      new_player.data.scoring_array = new_scoring_array;
      player_array.push(new_player.data);
    }

    // Update player username
    this.player_username = player_username

    // Push and create database object
    //max rounds = number of players
    this.database.ref("gameLobbies/" + game_room_ID).set({
      current_round: player_numbers,
      current_phase: "lobby_waiting",
      occupied: this.current_occupied,
      players: player_array,
      originalWidth: width,
      originalHeight: height,
      player_chat: ["Game: Welcome to Drawify!"], 
      game_winner: -1
    });
    
    // Send join message
    this.send_message("Just joined the game :D")
  };
  
  this.generateCode = function() {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let lobbyCode = "";
    for (let i = 0; i < 4; i++) {
        lobbyCode += letters[Math.floor(Math.random() * letters.length)];
    } 
    
    return lobbyCode;
  }
  
  
  
  
  
  
  //TESTING FUNCTION creates the testing lobby, must play through
  
  //CREATES TEST ROOM
  this.createTestRoom = function () {
    let player_numbers = 3
    //generate the code for the lobby
    var game_room_ID = 'TEST';
    
    // Initialize database reference and game_room_ID
    this.dbRootRef = firebase.database().ref('gameLobbies/' + game_room_ID);
    this.current_game_room = game_room_ID;

    // Attach and create host listener here
    this.host_listener();

    // Initialize game variables
    this.player_ID = 0;
    this.current_phase = "lobby_waiting";

    // Contains how many players will be in the game and whether they've joined
    
    this.current_occupied = [true];
    for (var i = 0; i < player_numbers - 1; i++) {
      this.current_occupied.push(false);
    }

    // This section contains the JSON format for describing the features of a game room
    console.log("Room created!");

    // Create each player game history profile
    var player_array = [];
    for (var i = 0; i < player_numbers; i++) {
      var new_player = new this.player_profile();
      new_player.data.username = "player" + i;
      player_array.push(new_player.data);
    }

    // Update player username
    this.player_username = "player" + this.player_ID;

    
    // Send join message
    this.send_message("Just joined the game :D")
  };
  
  
  //TESTING joins testing room
  
  this.joinTestRoom = function () {
    // Check if a room exists with the given name
    const dbRef = this.database.ref();
    dbRef
      .child("gameLobbies")
      .child('TEST')
      .get()
      .then((snapshot) => {
        if (snapshot.exists()) {
          // Take a snapshot of the current empty board state
          // Game initialization function call
          //this.initialize()
          var gameJSON = snapshot.val();
          this.current_phase = gameJSON.current_phase;
          this.player_ID = "player0";
          this.current_game_room ='TEST';
          this.dbRootRef = firebase
            .database()
            .ref("gameLobbies/" + this.current_game_room);

          // Post current board object
          console.log(snapshot.val());

          // Send join message
          this.send_message("Just joined the game :D")
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };
  
}
