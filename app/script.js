/* If you're feeling fancy you can add interactivity 
    to your site with Javascript */

// Be sure to name any p5.js functions we use in the global so Glitch can recognize them.
// Add to this list as you consult the p5.js documentation for other functions.
/* global text, firebase, Game, whiteboard, line, mousePressed, rotate, mouseReleased, firebaseConfig, keyReleased, noFill, pixels, keyCode, createCanvas, pmouseX, pmouseY, textSize, background, updatePixels, loadPixels, displayWidth, displayHeight, createButton, width, height, windowWidth, windowHeight, ellipse, mouseX, mouseY, fill, clear, rect, noStroke, createInput, stroke, strokeWeight */

// JS file to test the virtual whiteboard module
// Primary functionality resides in the user modifying the pixel array, which will then be sent to the firebase server as what the user had drawn on the canvas
// The user can also download a pixel array and set the values to their pixel array, allowing them to recieve virtual whiteboard drawing

// Global variable to keep track of mouse clicks
var mouseClick = false;
// Global variable to keep track of space bar
var spaceClick = false;

// Create whiteboard module for testing
var test_board_one = new whiteboard([0, 0, 600, 600]);
//var test_board_two = new whiteboard([600, 0, 600, 600]);
var login = new login_page();
// Create database variable
var database;
// Test game variable
var testGame;
// Int to check current page number
var page_number = 0;

// Text input box
var prompt_input;
var prompt_button;

function setup() {
  // Initialize the firebase server
  firebase.initializeApp(firebaseConfig);
  database = firebase.database();
  testGame = new Game(database);
  createCanvas(displayWidth, displayHeight);
  background(255);
  console.log(firebaseConfig);
  login.initialize_page();
  
  // Create text input box for prompt responses
  prompt_input = createInput();
  prompt_input.position(0, testGame.player_board.boundary[3] + 97);
  prompt_input.size(3 / 4 * testGame.player_board.boundary[2], testGame.player_board.boundary[1])
  
  // Create text input button for prompt responses
  prompt_button = createButton('submit');
  prompt_button.position(prompt_input.x + prompt_input.width, testGame.player_board.boundary[3] + 97);
  prompt_button.size(1 / 4 * testGame.player_board.boundary[2], testGame.player_board.boundary[1])
  prompt_button.mousePressed(submit_input);
}

function draw() {
  background(255);
  testGame.main_loop();
}

// Function to submit prompt/drawings by the players
function submit_input() {
  const prompt = prompt_input.value();
  prompt_input.value('');
  
  // Depending the phase of the game, we either send the player's prompt or their drawing
  if(testGame.current_phase == "initial_prompt") {
    testGame.update_prompt(prompt)
  } else if(testGame.current_phase == "drawing") {
    testGame.update_board(testGame.player_board.export())
  }
}

// Login Page Render
function login_page() {
  this.assets = [];
  
  this.initialize_page = function() {
    this.create_button(0, 0, 400, 200, [0, 0, 0]);
  }
  
  this.render_page = function() {
    for(var i = 0; i < this.assets.length; i++) {
      this.assets[i].interact()
      this.assets[i].animate()
      this.assets[i].render()
    }
  }
  
  this.create_button = function(x, y, w, h, color) {
    var new_button = new this.button_class();
    new_button.target_xpos = x;
    new_button.target_ypos = y;
    new_button.target_width = w;
    new_button.target_height = h;
    new_button.color = color;
    new_button.target_strokeWeight = 5
    this.assets.push(new_button);
  }
  
  this.button_class = function() {
    // Every page asset will have an actual and target value we can linearly interpolate between
    this.color = [255, 255, 255]
    this.target_strokeWeight = 0;
    this.target_xpos = 0;
    this.target_ypos = 0;
    this.target_width = 1;
    this.target_height = 1;
    this.target_rotation = 0;
    this.actual_strokeWeight = 0;
    this.actual_xpos = 0;
    this.actual_ypos = 0;
    this.actual_width = 1;
    this.actual_height = 1;
    this.actual_rotation = 0;
    
    this.interact = function(t1x, t1y, t2x, t2y) {
      var upper_x = this.actual_xpos + this.actual_width
      var upper_y = this.actual_ypos + this.actual_height
      if(mouseX < upper_x && mouseX > this.actual_xpos && mouseY < upper_y && mouseY > this.actual_ypos) {
        this.target_strokeWeight = 20;
      } else {
        this.target_strokeWeight = 0;
      }
    }
    
    this.animate = function() {
      this.actual_xpos += (this.target_xpos - this.actual_xpos) / 2
      this.actual_ypos += (this.target_ypos - this.actual_ypos) / 2
      this.actual_width += (this.target_width - this.actual_width) / 2
      this.actual_height += (this.target_height - this.actual_height) / 2
      this.actual_rotation += (this.target_rotation - this.actual_rotation) / 2
      this.actual_strokeWeight += (this.target_strokeWeight - this.actual_strokeWeight) / 4
    }
    
    this.render = function() {
      fill(this.color[0], this.color[1], this.color[2]);
      strokeWeight(this.actual_strokeWeight);
      rotate(this.actual_rotation);
      rect(this.actual_xpos, this.actual_ypos, this.actual_width, this.actual_height);
    }
  }
}

//
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