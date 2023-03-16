// Virtual whiteboard module, takes a boundary array defining the area of the canvas the whiteboard occupies
// Parameters: ([x_coord, y_coord, width, height])
function whiteboard(boundary) {
  // Whiteboard boundary array
  this.boundary = boundary;
  // Current brush color
  this.brush_color = [3, 227, 252];
  // Current brush size
  this.brush_size = 4;
  // Boolean to see whether we are drawing or erasing
  this.paint_toggle = true;
  // array to hold strokes
  this.board_strokes = [];
  
  // Main whiteboard logic loop
  this.main_loop = function() {
    // Set paint as inverse of space click
    this.paint_toggle = !spaceClick;
    // Block to draw on the whiteboard
    if(mouseClick) {
      // Check if we are painting or erasing
      if(this.paint_toggle) {
        this.paint(this.brush_color, this.brush_size);
      } else {
        this.paint([255, 255, 255], 40);
      }
    }
    // Render white board strokes
    for(var i = 0; i < this.board_strokes.length; i++) {
      // Get stroke characteristics
      strokeWeight(this.board_strokes[i][0]);
      stroke(this.board_strokes[i][1][0], this.board_strokes[i][1][1], this.board_strokes[i][1][2]);
      // Render the actual stroke
      line(this.board_strokes[i][2][0], this.board_strokes[i][2][1], this.board_strokes[i][2][2], this.board_strokes[i][2][3]);
    }
    // Render white board border
    strokeWeight(4);
    stroke(0);
    noFill();
    rect(this.boundary[0], this.boundary[1], this.boundary[2], this.boundary[3]);
  }
  
  // Whiteboard drawing function
  this.paint = function(brush_color, brush_size) {
    // Only paint if there is a stroke to paint
    if(mouseX != pmouseX || mouseY != pmouseY) {
      // Calculate outer and inner x and y boundary values
      var outerX = this.boundary[0] + this.boundary[2];
      var outerY = this.boundary[1] + this.boundary[3];
      // Calculate boolean boundaries
      var within_x = mouseX > this.boundary[0] && (mouseX < outerX);
      var within_y = mouseY > this.boundary[1] && (mouseY < outerY);
      // Check whether the mouse is within the boundary of the whiteboard
      if(within_x && within_y) {
        // Draw a line between the current and previous frame's mouse coordinates
        stroke(brush_color[0], brush_color[1], brush_color[2]);
        strokeWeight(brush_size);
        // Bound the mouse values within the whiteboard before processing the stroke
        var bound_mouseX = Math.max(this.boundary[0], Math.min(outerX, mouseX));
        var bound_mouseY = Math.max(this.boundary[1], Math.min(outerY, mouseY));
        var bound_pmouseX = Math.max(this.boundary[0], Math.min(outerX, pmouseX));
        var bound_pmouseY = Math.max(this.boundary[1], Math.min(outerY, pmouseY));
        // Push stroke into stroke array [brush_size, brush_color, stroke_points]
        this.board_strokes.push([brush_size, 
                                [brush_color[0], brush_color[1], brush_color[2]], 
                                [bound_mouseX, bound_mouseY, bound_pmouseX, bound_pmouseY]
                                ]);
      }
    }
  }
  
  // Return a JSON representation of the whiteboard
  this.export = function() {
    // Create a loop copy of the array
    var board_strokes_copy = [];
    for(var i = 0; i < this.board_strokes.length; i++) {
      // Get and push new board stroke coordinates
      board_strokes_copy.push([this.board_strokes[i][0], 
                              [this.board_strokes[i][1][0], this.board_strokes[i][1][1], this.board_strokes[i][1][2]], 
                              [this.board_strokes[i][2][0], this.board_strokes[i][2][1], this.board_strokes[i][2][2], this.board_strokes[i][2][3]]
                              ])
    }
    // Create a copy of the boundary array
    var boundary_copy = [this.boundary[0], this.boundary[1], this.boundary[2], this.boundary[3]];
    // Construct the JSON object
    var whiteboard_JSON = {
      boundary: boundary_copy, 
      board_strokes: board_strokes_copy
    };
    // Return the JSON object
    return whiteboard_JSON
  }
  
  // Load an image from an imported whiteboard JSON file
  this.import = function(whiteboard_JSON) {
    // Clear board strokes
    this.board_strokes.length = 0;
    // Calculate outer and inner x and y boundary values
    var innerX = this.boundary[0];
    var innerY = this.boundary[1];
    var outerX = this.boundary[0] + this.boundary[2];
    var outerY = this.boundary[1] + this.boundary[3];
    // Get coordinate translations
    var x_change = this.boundary[0] - whiteboard_JSON.boundary[0];
    var y_change = this.boundary[1] - whiteboard_JSON.boundary[1];
    // Iterate through boardstrokes
    for(var i = 0; i < whiteboard_JSON.board_strokes.length; i++) {
      // Get and push new board stroke coordinates
      this.board_strokes.push([whiteboard_JSON.board_strokes[i][0], 
                              [whiteboard_JSON.board_strokes[i][1][0], whiteboard_JSON.board_strokes[i][1][1], whiteboard_JSON.board_strokes[i][1][2]], 
                              [whiteboard_JSON.board_strokes[i][2][0] + x_change, whiteboard_JSON.board_strokes[i][2][1] + y_change, whiteboard_JSON.board_strokes[i][2][2] + x_change, whiteboard_JSON.board_strokes[i][2][3] + y_change]
                              ])
    }
  }
}
