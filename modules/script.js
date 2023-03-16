/* If you're feeling fancy you can add interactivity 
    to your site with Javascript */

// Be sure to name any p5.js functions we use in the global so Glitch can recognize them.
// Add to this list as you consult the p5.js documentation for other functions.
/* global text, firebase, Game, createElement, whiteboard, createDiv, line, mousePressed, rotate, mouseReleased, firebaseConfig, keyReleased, noFill, pixels, keyCode, createCanvas, pmouseX, pmouseY, textSize, background, updatePixels, loadPixels, displayWidth, displayHeight, createButton, width, height, windowWidth, windowHeight, ellipse, mouseX, mouseY, fill, clear, rect, noStroke, createInput, stroke, strokeWeight */

// JS file to test the virtual whiteboard module
// Primary functionality resides in the user modifying the pixel array, which will then be sent to the firebase server as what the user had drawn on the canvas
// The user can also download a pixel array and set the values to their pixel array, allowing them to recieve virtual whiteboard drawing

// Global variable to keep track of mouse clicks
var mouseClick = false;
// Global variable to keep track of space bar
var spaceClick = false;

// Create whiteboard module for testing
var test_board_one = new whiteboard([0, 0, 600, 600]);
// Create database variable
var database;
// Test game variable
var testGame;
// Int to check current page number
var page_number = 0;

// Text input box
var prompt_input;
var prompt_button;

// Define page divs
var div;
var player_list;
var div_screen_padding;
var div_width;

function setup() {
  // Initialize the firebase server
  firebase.initializeApp(firebaseConfig);
  database = firebase.database();
  testGame = new Game(database);
  createCanvas(displayWidth, displayHeight);
  background(255);
  console.log(firebaseConfig);
  
  // Create text input box for prompt responses
  prompt_input = createInput();
  prompt_input.position(testGame.player_board.boundary[0], testGame.player_board.boundary[3] + 97);
  prompt_input.size(3 / 4 * testGame.player_board.boundary[2], testGame.player_board.boundary[1])
  prompt_input.style('border-radius', '25px')
  prompt_input.style('font-size', '25px')
  
  // Create text input button for prompt responses
  prompt_button = createButton('submit');
  prompt_button.position(prompt_input.x + prompt_input.width, testGame.player_board.boundary[3] + 97);
  prompt_button.size(1 / 4 * testGame.player_board.boundary[2], testGame.player_board.boundary[1])
  prompt_button.mousePressed(submit_input);
  prompt_button.style('border-radius', '25px')
  prompt_button.style('font-size', '25px')
    
  // Create Screen div
  div = createDiv();
  div_screen_padding = 10;
  div_width = testGame.player_board.boundary[0] - 2 * div_screen_padding;
  div.style('font-size', '16px');
  div.style('color', '#000000');
  div.style('height', testGame.player_board.boundary[3] + 'px')
  div.style('width', div_width + 'px')
  div.style('background-color', '#ffffff')
  div.style('overflow-y', 'auto')
  div.position(div_screen_padding, testGame.player_board.boundary[1]);
  div.id('player_status')
  
  // Create ordered list for player status div
  player_list = createElement('ol');
  player_list.style('list-style-type', 'none')
  player_list.parent('player_status')
  player_list.id('player_list')
}

function draw() {
  background(66, 44, 143);
  
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
