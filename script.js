/*
script.js for sand_paint
author: thibaut voirand
*/

/*Declaring variables*******************************************************************************
***************************************************************************************************/

// canvas related variables
var canvas = document.getElementById('canvasId');
var canvasContext = canvas.getContext('2d');
var canvasData = canvasContext.getImageData(0, 0, canvas.width, canvas.height);
var pixelsCoordinates = [[]];
var rPixel = 255; // pixel color red
var gPixel = 0; // pixel color green
var bPixel = 0; // pixel color blue
var aPixel = 100; // pixel transparency

// input parameters
var x0;
var y0;
var x1;
var y1;
var pixelsDensity;

/*Functions*****************************************************************************************
***************************************************************************************************/

function drawPixel(x, y, r, g, b, a) {
  var index = (x + y * canvas.width) * 4;

  canvasData.data[index + 0] = r;
  canvasData.data[index + 1] = g;
  canvasData.data[index + 2] = b;
  canvasData.data[index + 3] = a;
}

function updateCanvas() {
  canvasContext.putImageData(canvasData, 0, 0);
}

function clearCanvas() {
  /*
  Clears the contents of the canvas
  */

  var j;
  for (j = 0; j < canvasData.data.length; j++) {
    canvasData.data[j] = 0;
  }

  updateCanvas();
}

function getOctant(dx, dy) {
  /*
  Returns the octant in which a line is, in the following scheme, with starting point at center:
  \2|1/
  3\|/0
 ---+---
  4/|\7
  /5|6\
  */
  var octant = 0;
  if (dx >= 0 && dy >= 0 && dx <= dy) {
    // octant 1
    octant = 1;
  } else if (dx <= 0 && dy >= 0 && -dx <= dy) {
    // octant 2
    octant = 2;
  } else if (dx <= 0 && dy >= 0 && -dx >= dy) {
    // octant 3
    octant = 3;
  } else if (dx <= 0 && dy <= 0 && -dx >= -dy) {
    // octant 4
    octant = 4;
  } else if (dx <= 0 && dy <= 0 && -dx <= -dy) {
    // octant 5
    octant = 5;
  } else if (dx >= 0 && dy <= 0 && dx <= -dy) {
    // octant 6
    octant = 6;
  } else if (dx >= 0 && dy <= 0 && dx >= -dy) {
    // octant 7
    octant = 7;
  }
  return octant;
}

function switchToOctantZeroFrom(octant, x, y) {
  /*
  Function to apply on starting and ending points coordinates, to move the line's from original
  octant to octant zero
  */
  if (octant == 0) {
    return [x, y];
  } else if (octant == 1) {
    return [y, x];
  } else if (octant == 2) {
    return [y, -x];
  } else if (octant == 3) {
    return [-x, y];
  } else if (octant == 4) {
    return [-x, -y];
  } else if (octant == 5) {
    return [-y, -x];
  } else if (octant == 6) {
    return [-y, x];
  } else if (octant == 7) {
    return [x, -y];
  }
}

function switchFromOctantZeroTo(octant, x, y) {
  /*
  Function to apply on starting and ending points coordinates, to move the line's from octant zero
  back to original octant
  */
  if (octant == 0) {
    return [x, y];
  } else if (octant == 1) {
    return [y, x];
  } else if (octant == 2) {
    return [-y, x];
  } else if (octant == 3) {
    return [-x, y];
  } else if (octant == 4) {
    return [-x, -y];
  } else if (octant == 5) {
    return [-y, -x];
  } else if (octant == 6) {
    return [y, -x];
  } else if (octant == 7) {
    return [x, -y];
  }
}

function getPixelsCoordsOfLine(x0, y0, x1, y1, octant) {
  /*
  fills an array with the coordinates of the pixels forming a line between starting point (x0,y0)
  and ending point (x1,y1) following the bresenham integer based line algorithm
  Input:
      x0    : starting point X axis coordinate
      y0    : starting point Y axis coordinate
      x1    : ending point X axis coordinate
      y1    : ending point Y axis coordinate
      octant: octant of the line (see getOctant function)
  Output:
      outputCoordinates:  array containing the coordinates of the pixels forming the line
  */

  var outputCoordinates = [[]]; // output coordinates array

  [x0, y0] = switchToOctantZeroFrom(octant, x0, y0);
  [x1, y1] = switchToOctantZeroFrom(octant, x1, y1);

  var dx = x1 - y0;
  var dy = y1 - y0;
  var D = 2 * dy - dx;
  var y = y0; //

  for (x = x0; x < x1; x++) {
    // switching back to starting octant and filling output coordinates array
    outputCoordinates.push([
      switchFromOctantZeroTo(octant, x, y)[0],
      switchFromOctantZeroTo(octant, x, y)[1]
    ]);
    if (D > 0) {
      y = y + 1;
      D = D - 2 * dx;
    }
    D = D + 2 * dy;
  }

  outputCoordinates = outputCoordinates.slice(1, outputCoordinates.length); // slicing out first value, which is empty
  return outputCoordinates;
}

function selectRandomPixels(inputCoordinates, n) {
  /*
  Selects n random coordinates from an array of coordinates
  Input:
    inputCoordinates  : input array of coordinates
  Output:
    randomCoordinates : array containing n coordinates chosen randomly from the input array
  */
  var randomCoordinates = new Array(n);

  var j;
  for (j = 0; j < n; j++) {
    randomCoordinates[j] =
      inputCoordinates[
        Math.round(Math.random() * (inputCoordinates.length - 1))
      ];
  }

  return randomCoordinates;
}

function getInputParameters() {
  /*
  This function assigns user-entered parameters to the corresponding variables
  */
  x0 = parseInt(document.getElementById('x0Input').value);
  y0 = parseInt(document.getElementById('y0Input').value);
  x1 = parseInt(document.getElementById('x1Input').value);
  y1 = parseInt(document.getElementById('y1Input').value);
  pixelsDensity = parseInt(document.getElementById('pixelsDensityInput').value);
}

/*User-Interaction**********************************************************************************
***************************************************************************************************/

document.getElementById('drawButton').onclick = function() {
  getInputParameters();

  var k;
  for (k = 0; k < 100; k++) {
    x0 = x0 + 1;
    x1 = x1 + 1;

    var dx = x1 - x0;
    var dy = y1 - y0;

    // case of a single point
    if (dx == 0 && dy == 0) {
      drawPixel(x0, y0, rPixel, gPixel, bPixel, aPixel);
      updateCanvas();
      return;
    }

    var octant = getOctant(dx, dy);

    // obtaining coordinates of pixels forming line using bresenham's algorithm
    pixelsCoordinates = getPixelsCoordsOfLine(x0, y0, x1, y1, octant);

    // selecting random pixels along the line
    pixelsCoordinates = selectRandomPixels(pixelsCoordinates, pixelsDensity);

    // drawing selected pixels
    var j;
    for (j = 0; j < pixelsCoordinates.length; j++) {
      drawPixel(
        pixelsCoordinates[j][0],
        pixelsCoordinates[j][1],
        rPixel,
        gPixel,
        bPixel,
        aPixel
      );
    }
  }

  updateCanvas();
};

document.getElementById('clearButton').onclick = function() {
  clearCanvas();
};
