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


//create and join lobby buttons
var lobby_join_button;
var lobby_create_button;


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
  prompt_input.position(10, testGame.player_board.boundary[3] + 97);
  prompt_input.size(3 / 4 * testGame.player_board.boundary[2], testGame.player_board.boundary[1])
  
  // Create text input button for prompt responses
  prompt_button = createButton('submit');
  prompt_button.position(prompt_input.x + prompt_input.width, testGame.player_board.boundary[3] + 97);
  prompt_button.size(1 / 4 * testGame.player_board.boundary[2], testGame.player_board.boundary[1])
  prompt_button.mousePressed(submit_input);
    
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

  
  //Join Lobby Button
  lobby_create_button = createButton('Make New Lobby');
  lobby_create_button.position((testGame.player_board.boundary[0] + testGame.player_board.boundary[2])/2, (testGame.player_board.boundary[1] + testGame.player_board.boundary[3])/2 - 100);
  lobby_create_button.size(1 / 4 * testGame.player_board.boundary[2], testGame.player_board.boundary[1]);
  lobby_create_button.mousePressed(create_game);
  
  //Join Lobby Button
  lobby_join_button = createButton('Join Existing Lobby');
  lobby_join_button.position((testGame.player_board.boundary[0] + testGame.player_board.boundary[2])/2, (testGame.player_board.boundary[1] + testGame.player_board.boundary[3])/2 + 100);
  lobby_join_button.size(1 / 4 * testGame.player_board.boundary[2], testGame.player_board.boundary[1]);
  lobby_join_button.mousePressed(join_game);
  

}

function draw() {
  background(51, 211, 232);
  
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


function create_game() {
  let numPlayers = prompt("Enter Number of Players");
  
  testGame.createRoom(numPlayers) //change these to be proper parameters
  
  lobby_create_button.remove();
  lobby_join_button.remove();
}

function join_game(){
  let code = prompt("Enter 4 letter lobby code");
  testGame.joinRoom(code);
  
  //remove buttons (if successful)
  lobby_create_button.remove();
  lobby_join_button.remove();
  
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