/* global text, firebase, Game, createElement, whiteboard, createDiv, line, mousePressed, rotate, mouseReleased, firebaseConfig, keyReleased, noFill, pixels, keyCode, createCanvas, pmouseX, pmouseY, textSize, background, updatePixels, loadPixels, displayWidth, displayHeight, createButton, width, height, windowWidth, windowHeight, ellipse, mouseX, mouseY, fill, clear, rect, noStroke, createInput, stroke, strokeWeight */

/* If you're feeling fancy you can add interactivity 
    to your site with Javascript */

// Be sure to name any p5.js functions we use in the global so Glitch can recognize them.
// Add to this list as you consult the p5.js documentation for other functions.

// JS file to test the final game page
// Primary functionality resides in the user modifying the pixel array, which will then be sent to the firebase server as what the user had drawn on the canvas
// The user can also download a pixel array and set the values to their pixel array, allowing them to recieve virtual whiteboard drawing

// Global variable to keep track of mouse clicks
var mouseClick = false;
// Global variable to keep track of space bar
var spaceClick = false;

// Create whiteboard module for testing
var test_board_one = new whiteboard([0, 0, 600, 600]);
var test_board_two = new whiteboard([0, 600, 600, 1200])
// Create database variable
var gameRef;
var game;
// Test game variable


function setup() {

  //get lobby code from html queury
  const queryParams = new URLSearchParams(window.location.search);
  const lobbyCode = queryParams.get('code');

  // Show connected lobbycode
  console.log(`Param1 value: ${lobbyCode}`);
  
  //site background
  createCanvas(displayWidth, displayHeight);
  background(255);
  
  
  //get lobby data from firebase
  
  gameRef = firebase.database().ref(`gameLobbies/${lobbyCode}`);
  gameRef.once("value")
    .then(function(snapshot) {
    
    game = snapshot.val()
    
    drawBoards(game);
  });


  
  /*
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
  */

}

function draw() {
  background(51, 211, 232);

}

function drawBoards(game){
  
  console.log(game.current_round);
  
}


/*
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

*/
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