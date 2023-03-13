/* global tokenHoverAudio, whiteboard, createElement, createDiv, tokenBuildAudio, tokenConquerAudio, tokenScoreAudio, Howl, loadSound, triangle, color, beginShape, endShape, vertex, GameBoard, PoissonDisc, text, line, noFill, p5,Delaunator,  random, createVector, firebase, textAlign, keyCode, CENTER, mousePressed, mouseReleased, createCanvas, createSlider, textSize, background, displayWidth, displayHeight, createButton, width, height, windowWidth, windowHeight, ellipse, mouseX, mouseY, fill, clear, rect, noStroke, createInput, stroke, strokeWeight */

function Game(db) {
  // Initialize database variable
  this.database = db;
  // Current game room variable
  this.current_game_room;
  // Player ID value
  this.player_ID = -1;
  // Keep track of current game phase
  this.current_phase = "no_game"
  // Database reference to game root node 
  this.dbRootRef = firebase.database().ref('gameLobbies/' + this.currentGameRoom);
  
  // Initialize and create the whiteboard object
  var whiteboard_edge_x = displayWidth / 6
  this.player_board = new whiteboard([whiteboard_edge_x, displayHeight / 10, 6/8 * displayWidth - whiteboard_edge_x, displayHeight - (4 * displayHeight / 10)]);
  
  // Keep track of current player prompt
  this.current_prompt = "";
  
  // Keep track of the recieved prompt
  this.received_prompt = ""
  
  // Keep track of all player data
  this.player_data = [];
  
  // HTML Elements for status rendering
  this.player_status_elements = [];
  
  // Keep track of lobby joining
  this.current_occupied = []
  
  // JSON object that describes players during the game
  this.player_profile = function() {
    this.data = {
      username: "", 
      current_prompt_ready: false, 
      current_prompt: "", 
      current_board_ready: false, 
      current_board: -1, 
      previous_prompts: [-1], 
      previous_boards: [-1]
    }
  }
  
  // Main render function for the game
  this.main_loop = function() {
    // Render the whiteboard
    this.player_board.main_loop();
    
    // Render the upper text prompt
    textSize(60);
    fill(255)
    strokeWeight(1)
    if(this.current_phase == "no_game") {
      
      text('Please join or start a game :D', 10, 60);
      
    } else if(this.current_phase == "lobby_waiting") {
      
      text(`Waiting for game to start: Lobby code: ${this.current_game_room}`, 10, 60);
      
    } else if(this.current_phase == "initial_prompt") {
      
      text('Please enter a prompt below :)!', 10, 60)
      
    } else if(this.current_phase == "drawing") {
      
      text(('Prompt to Draw For: ' + this.received_prompt), 10, 60)
      
    }
    
    // Render player status div
    // Create div for player status
  }
  
  // Update a player's prompt on the server
  this.update_prompt = function(prompt) {
    // Change the current prompt
    this.database
      .ref("gameLobbies/" + this.current_game_room + "/players/" + this.player_ID + "/current_prompt")
      .set(prompt);
    
    // Update prompt completion
    this.database
      .ref("gameLobbies/" + this.current_game_room + "/players/" + this.player_ID + "/current_prompt_ready")
      .set(true);
  }
  
  // Update a player's board on the server
  this.update_board = function(board) {
    // Change the current prompt
    this.database
      .ref("gameLobbies/" + this.current_game_room + "/players/" + this.player_ID + "/current_board")
      .set(board);
    
    // Update prompt completion
    this.database
      .ref("gameLobbies/" + this.current_game_room + "/players/" + this.player_ID + "/current_board_ready")
      .set(true);
  }
  
  // Acts as the host's listener to the database
  // All changes on the database are processed by the host, which would be within this function
  this.host_listener = function() {
    // Attach listeners to mark for when a new turn starts for the player
    this.dbRootRef.on('value', (snapshot) => {
      const data = snapshot.val();
      this.current_phase = data.current_phase;
      this.current_occupied = data.occupied;
      this.player_data = data.players;
      console.log(this.player_data)
      
      // Update player ready status depending on the game type
      for(var i = 0; i < this.player_data.length; i++) {
        var status_emoji = '🟢'
        if(data.current_phase == "lobby_waiting") {
          if(!this.current_occupied[i]) {
            status_emoji ='🔴'
          }
        } else if(data.current_phase == "drawing") {
          if(!this.player_data[i].current_board_ready) {
            status_emoji ='🔴'
          }
        } else if(data.current_phase == "initial_prompt") {
          if(!this.player_data[i].current_prompt_ready) {
            status_emoji ='🔴'
          }
        }
        
        this.player_status_elements[i].html('player' + i + ' ready: ' + status_emoji)
      }
      
      // Check whether the game has started
      if(data.current_phase == "lobby_waiting") {
        // Check if all players have entered the lobby
        var game_started = true;
        for(var i = 0; i < this.current_occupied.length; i++) {
          if(this.current_occupied[i] == false) {
            game_started = false;
            break;
          }
        }
        
        // Change game state if everybody's in the lobby
        if(game_started) {
          console.log("The game has started!!! WOOHOO")
          this.current_phase = "initial_prompt"
              
          // Change current game phase
          this.database
            .ref("gameLobbies/" + this.current_game_room + "/current_phase")
            .set(this.current_phase);
        }
      } else if(data.current_phase == "initial_prompt") {
        // Clear whiteboard
        this.player_board.clear_board();
        
        // Get the latest swapped board from server
        if(data.players[this.player_ID].current_board != -1) {
          this.player_board.import(data.players[this.player_ID].current_board)
        }
        
        // Check whether all players have submitted a prompt or not and if they have, change to next cycle
        var prompts_completed = true;
        for(var i = 0; i < data.players.length; i++) {
          if(!data.players[i].current_prompt_ready) {
            prompts_completed = false;
            break;
          }
        }
        
        // Change game state if everybody has submitted a prompt and start swapping prompts over
        if(prompts_completed){
          console.log("Everybody finished writing!!!")
          this.current_phase = "drawing"
          
          // Clear whiteboard
          this.player_board = new whiteboard([0, displayHeight / 10, 2/3 * displayWidth, displayHeight - (4 * displayHeight / 10)]);
          
          // Copy and update player data
          var new_players = []
          for(var i = 0; i < data.players.length; i++) {
            new_players[i] = data.players[i]
            // Update previous prompts
            new_players[i].previous_prompts.push(new_players[i].current_prompt);
            // Reset prompts for next phase
            new_players[i].current_prompt_ready = false;
          }
          // Store replacement prompts
          var replace_prompt = new_players[0].current_prompt
          for(var i = 1; i < new_players.length; i++) {
            var swap_prompt = new_players[i].current_prompt
            new_players[i].current_prompt = replace_prompt
            replace_prompt = swap_prompt
          }
          new_players[0].current_prompt = replace_prompt
          
          // Update game
          var data_copy = data;
          data_copy.players = new_players;
          data_copy.current_phase = this.current_phase
          
          // Change the current game phase and all corresponding game data
          this.database
            .ref("gameLobbies/" + this.current_game_room)
            .set(data_copy);
        }
      } else if(data.current_phase == "drawing") {
        // Get the recieved prompt
        this.received_prompt = data.players[this.player_ID].current_prompt;
        
        // Check whether all players are done drawing
        var drawings_completed = true;
        for(var i = 0; i < data.players.length; i++) {
          if(!data.players[i].current_board_ready) {
            drawings_completed = false;
            break;
          }
        }
        
        // Change game state if everyone is done drawing
        if(drawings_completed) {
          console.log("Everybody finished drawing!!!")
          this.current_phase = "initial_prompt"
          
          // Copy and update player data
          var new_players = []
          for(var i = 0; i < data.players.length; i++) {
            new_players[i] = data.players[i]
            // Update previous boards
            new_players[i].previous_boards.push(new_players[i].current_board);
            // Reset boards for next phase
            new_players[i].current_board_ready = false;
          }
          
          // Store replacement boards
          var replace_board = new_players[0].current_board
          for(var i = 1; i < new_players.length; i++) {
            var swap_board = new_players[i].current_board
            new_players[i].current_board = replace_board
            replace_board = swap_board
          }
          new_players[0].current_board= replace_board
          
          // Update game
          var data_copy = data;
          data_copy.players = new_players;
          data_copy.current_phase = this.current_phase
          
          // Since a drawing phase has finished that's 1 round, so reduce the round
          data_copy.current_round -= 1;
          
          // Check whether rounds have finished and if so, switch next mode to the scoring mode
          if(data_copy.current_round == 0) {
            data_copy.current_phase = "scoring"
          }
          
          // Change the current game phase and all corresponding game data
          this.database
            .ref("gameLobbies/" + this.current_game_room)
            .set(data_copy);
        }
      } else if(data.current_phase == "scoring") {
        // Add page code for scoring here
        console.log("THE GAME IS OVERRRR, WE SCORING NOW WOOT WOOT!")
      }
    });
  }
  
  // Acts as the player's listener to the database
  // All changes on the database processed by the player would happen in this function
  this.player_listener = function() {
    this.dbRootRef.on('value', (snapshot) => {
      const data = snapshot.val();
      this.current_phase = data.current_phase;
      this.current_occupied = data.occupied;
      this.player_data = data.players;
      
      // Update player ready status depending on the game type
      for(var i = 0; i < this.current_occupied.length; i++) {
        var status_emoji = '🟢'
        if(data.current_phase == "lobby_waiting") {
          if(!this.current_occupied[i]) {
            status_emoji ='🔴'
          }
        } else if(data.current_phase == "drawing") {
          if(!this.player_data[i].current_board_ready) {
            status_emoji ='🔴'
          }
        } else if(data.current_phase == "initial_prompt") {
          if(!this.player_data[i].current_prompt_ready) {
            status_emoji ='🔴'
          }
        }
        
        this.player_status_elements[i].html('player' + i + ' ready: ' + status_emoji)
      }
      
      if(this.current_phase == "initial_prompt") {
        // Get the latest swapped board from server
        if(data.players[this.player_ID].current_board != -1) {
          this.player_board.import(data.players[this.player_ID].current_board)
        }
      } else if(this.current_phase == "drawing") {
        // Get the new prompt
        this.player_board = new whiteboard([0, displayHeight / 10, 2/3 * displayWidth, displayHeight - (4 * displayHeight / 10)]);
        this.received_prompt = data.players[this.player_ID].current_prompt;
      } else if(this.current_phase == "scoring") {
        
      }
    });
  }
  
  // Join online game if available and if not create one instead
  // Only the player, listener, manager, and called would occur in here
  this.joinRoom = function(game_room_ID) {
    // Check if a room exists with the given name
    const dbRef = this.database.ref();
    dbRef
      .child("gameLobbies")
      .child(game_room_ID)
      .get()
      .then(snapshot => {
        if(snapshot.exists()) {
          // Take a snapshot of the current empty board state
          // Game initialization function call
          //this.initialize()
          var gameJSON = snapshot.val();
          this.player_ID = -1
          this.current_game_room = game_room_ID
          this.dbRootRef = firebase.database().ref('gameLobbies/' + this.current_game_room);
          
          // Attach listeners to mark for when a new turn starts for the player
          this.player_listener();
            
          // Only join game if room is unnoccupied
          this.current_occupied = gameJSON.occupied
          var open_slot_ID = -1
          for(var i = 0; i < this.current_occupied.length; i++) {
            if(this.current_occupied[i] == false) {
              open_slot_ID = i
              this.current_occupied[i] = true
              break
            }
          }
            
          // Check whether an open game slot was succesfully obtained
          if(open_slot_ID != -1) {
            this.player_ID = open_slot_ID
            //this.getTurn()
          }
            
          // Post current board object
          console.log(snapshot.val());
          // Indicate room has now occupied a slot
          this.database
            .ref("gameLobbies/" + game_room_ID + "/occupied")
            .set(this.current_occupied);
          
          // Create HTML game status elements
          // Display player statuses by iterating through player data
          for(var i = 0; i < this.player_data.length; i++) {
            // Get status emoji
            var status_emoji = '🔴';
    
            this.player_status_elements.push(createElement('li', 'player' + i + ': ' + status_emoji));
            //player_li.elt.textContent = "overwrite"
            this.player_status_elements[i].parent('player_list')
          }
        }
      })
    .catch(error => {
      console.error(error)
    });
  }
  
  // Function to create an online game of your own
  // Only the host-listener, manager, and calls would occur in here
  this.createRoom = function(player_numbers) {
    //generate the code for the lobby
    var game_room_ID = this.generateCode();
    
    // Initialize database reference and game_room_ID
    this.dbRootRef = firebase.database().ref('gameLobbies/' + game_room_ID);
    this.current_game_room = game_room_ID;
          
    // Attach and create host listener here
    this.host_listener();

    // Initialize game variables
    this.player_ID = 0;
    this.current_phase = "lobby_waiting";
    
    // Contains how many players will be in the game and whether they've joined
    this.current_occupied = [true]
    for(var i = 0; i < player_numbers - 1; i++) {
      this.current_occupied.push(false)
    }
    
    // This section contains the JSON format for describing the features of a game room
    console.log("Room created!")
    console.log(`${this.current_game_room}`)
          
    // Create each player game history profile
    var player_array = []
    for(var i = 0; i < player_numbers; i++) {
      var new_player = new this.player_profile()
      new_player.data.username = "player" + i;
      player_array.push(new_player.data);
    }
    
    // Push and create database object
    this.database.ref("gameLobbies/" + game_room_ID).set({
      current_round: player_numbers , 
      current_phase: "lobby_waiting",
      occupied: this.current_occupied, 
      players: player_array, 
      originalWidth: width,
      originalHeight: height
    });
    
    // Create HTML game status elements
    // Display player statuses by iterating through player data
    for(var i = 0; i < this.player_data.length; i++) {
      console.log(this.player_data.length)
      // Get status emoji
      var status_emoji = '🔴';
      // Create player status HTML element
      var player_li = createElement('li', 'player' + i + ': ' + status_emoji)
      player_li.parent('player_list')
      this.player_status_elements.push(player_li);
      //this.player_status_elements[i].html('overwrite test')
      
    }
    console.log("Number of status elements: " + this.player_status_elements.length)
  }
  
    //randomly generates 4 letter code for lobby name/join code
  this.generateCode = function() {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let lobbyCode = "";
    for (let i = 0; i < 4; i++) {
        lobbyCode += letters[Math.floor(Math.random() * letters.length)];
    } 

    return lobbyCode;
  }
  
}