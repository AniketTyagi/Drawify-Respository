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
  // pixel array to store the values of the whiteboard pixels
  this.board_pixels = [];
  
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
    // Render white board border
    strokeWeight(4);
    stroke(0);
    noFill();
    rect(this.boundary[0], this.boundary[1], this.boundary[2], this.boundary[3]);
  }
  
  // Whiteboard drawing function
  this.paint = function(brush_color, brush_size) {
    // Calculate outer and inner x and y boundary values
    var innerX = this.boundary[0];
    var innerY = this.boundary[1];
    var outerX = this.boundary[0] + this.boundary[2];
    var outerY = this.boundary[1] + this.boundary[3];
    // Calculate boolean boundaries
    var within_x = mouseX > innerX && (mouseX < outerX);
    var within_y = mouseY > innerY && (mouseY < outerY);
    // Check whether the mouse is within the boundary of the whiteboard
    if(within_x && within_y) {
      // Draw a line between the current and previous frame's mouse coordinates
      stroke(brush_color[0], brush_color[1], brush_color[2]);
      strokeWeight(brush_size);
      // Bound the mouse values within the whiteboard before processing the stroke
      var bound_mouseX = Math.max(innerX, Math.min(outerX, mouseX));
      var bound_mouseY = Math.max(innerY, Math.min(outerY, mouseY));
      var bound_pmouseX = Math.max(innerX, Math.min(outerX, pmouseX));
      var bound_pmouseY = Math.max(innerY, Math.min(outerY, pmouseY));
      // Draw the paint stroke
      line(bound_mouseX, bound_mouseY, bound_pmouseX, bound_pmouseY);
    }
  }
  
  // Save a snapshot of the current pixels in the whiteboard in a reduced pixel_array
  // Repeated calls to this function will crash the browser as per-frame you are loading all canvas pixels
  this.save = function() {
    // Calculate outer and inner x and y boundary values
    var innerX = this.boundary[0];
    var innerY = this.boundary[1];
    var outerX = this.boundary[0] + this.boundary[2];
    var outerY = this.boundary[1] + this.boundary[3];
    // Load pixels from canvas and then save
    loadPixels();
    // Iterate through screen pixels and store into an array
    for(var i = 0; i < (outerY - innerY); i++) {
      for(var j = 0; j < (outerX - innerX); j++) {
        // Get index for pixel array
        var index = (j + i * width) * 4;
        // Translate canvas reference frame to whiteboard reference frame
        var canvas_index = ((j + innerX) + (i + innerY) * width) * 4;
        this.board_pixels[index + 0] = pixels[canvas_index + 0];
        this.board_pixels[index + 1] = pixels[canvas_index + 1];
        this.board_pixels[index + 2] = pixels[canvas_index + 2];
        this.board_pixels[index + 3] = pixels[canvas_index + 3];
      }
    }
  }
  
  // Return a JSON representation of the whiteboard
  this.export = function() {
    // Create a shallow copy of board_pixels
    var board_pixels_copy = [];
    for(var i = 0; i < this.board_pixels.length; i++) {
      board_pixels_copy[i] = this.board_pixels[i];
    }
    // Construct the JSON object
    var whiteboard_JSON = {
      boundary: this.boundary, 
      board_pixels: board_pixels_copy
    };
    // Return the JSON object
    return whiteboard_JSON
  }
  
  // Load an image from an imported whiteboard JSON file
  this.import = function(whiteboard_JSON) {
    // Get white board JSON values into current whiteboard module
    // this.boundary = whiteboard_JSON.boundary;
    // Update the canvas pixels
    loadPixels();
    // Calculate outer and inner x and y boundary values
    var innerX = this.boundary[0];
    var innerY = this.boundary[1];
    var outerX = this.boundary[0] + this.boundary[2];
    var outerY = this.boundary[1] + this.boundary[3];
    // Iterate through canvas
    for(var i = 0; i < (outerY - innerY); i++) {
      for(var j = 0; j < (outerX - innerX); j++) {
        // Get index for pixel array
        var index = (j + i * width) * 4;
        // Translate canvas reference frame to whiteboard reference frame
        var canvas_index = ((j + innerX) + (i + innerY) * width) * 4;
        pixels[canvas_index + 0] = whiteboard_JSON.board_pixels[index + 0];
        pixels[canvas_index + 1] = whiteboard_JSON.board_pixels[index + 1];
        pixels[canvas_index + 2] = whiteboard_JSON.board_pixels[index + 2];
        pixels[canvas_index + 3] = whiteboard_JSON.board_pixels[index + 3];
        // Shallow copy the JSON object
        this.board_pixels[index + 0] = whiteboard_JSON.board_pixels[index + 0];
        this.board_pixels[index + 1] = whiteboard_JSON.board_pixels[index + 1];
        this.board_pixels[index + 2] = whiteboard_JSON.board_pixels[index + 2];
        this.board_pixels[index + 3] = whiteboard_JSON.board_pixels[index + 3];
        // Shallow copy the JSON object
      }
    }
    // Update pixel array
    updatePixels();
  }
}
