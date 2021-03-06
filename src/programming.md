---
layout: "altbase.njk"
title: Programming
usecode: true
startcode: "whenReady()"
---
<script src="/assets/js/tesseract.js"></script>
<canvas id="canvas3d" width="500" height="400"></canvas>

I program in C, C++, Python, PHP, Javascript and a number of languages that are long forgotten.
This is just an example of a little "toy" that I wrote for fun. A tesseract, is to a cube, as a cube is to a square. It is a fundamental 4 dimensional piece of geometry. Then, I set it to rotate on all of the six axes that it has. It's interesting, I think, because while it appears to be a cube within a cube, all of the sides are the same length! They appear to grow and shrink as they get closer to you, just like a cube does, but it looks inside out.

If you are interested, I have placed the code for it below. I didn't use WebGl, because I was playing around with writing my own software renderer.  

```javascript
// A simple tesseract
class Tesseract {
    constructor (win) {
        this.win = win;
        // The vertices of a tesseract
        this.tess = [];

        // Go ahead and fill those vertices
        for (let i = 0; i < 16; i++) {
            this.tess.push(this.bits_to_coords(i));
        }
    }

    // create the coordinates for a tesseract 
    // from the bits while we count
    bits_to_coords(n) {
        let x = (n & 1) ? 1 : -1;
        let y = (n & 2) ? 1 : -1;
        let z = (n & 4) ? 1 : -1;
        let w = (n & 8) ? 1 : -1;
        return new Array(x, y, z, w);
    }

    // Every frame, we'll run through this
    doTesseract () {
        // clear the screen
        win_context.clearRect(0, 0, win.width, win.height);

        // Make a rotation matrix for each of
        // the SIX axis of rotation that a 4D object has
        let rotxy = this.getRotXY(angle);
        let rotxz = this.getRotXZ(angle);
        let rotxw = this.getRotXW(angle);
        let rotyz = this.getRotYZ(angle);
        let rotyw = this.getRotYW(angle);
        let rotzw = this.getRotZW(angle);

        let projected = [];
        let that = this;

        this.tess.forEach(function (i) {
            i = mat_mul_vert(rotxy, i);             // Rotate it on the XY (that's the Z axis)
            i = mat_mul_vert(rotxz, i);             // Rotate it on the XZ (that's the Y axis)
            i = mat_mul_vert(rotxw, i);             // Rotate it in the XW (I have no idea what it's called)
            i = mat_mul_vert(rotyz, i);             // Rotate it on the YZ (that's the X axis)
            i = mat_mul_vert(rotyw, i);             // Rotate it on the YW (no idea how to name it)
            i = mat_mul_vert(rotzw, i);             // Rotate it on the ZW (and another that I can't name)
			
            i = mat_mul_vert(that.persp4D(i), i);
            i = mat_mul_vert(that.persp3D(i), i);
            i = vert_scale_mult(i, 300);            // Scale all of the vertices up
            i[0] += that.win.width / 2;             // Translate them over on the x
            i[1] += that.win.height / 2;            // Translate them over on the y
            projected.push(i);                      // And add them to the list of projected vertices
        });

        for (let p = 0; p < projected.length; p++) {
            drawVertices(projected[p][0], projected[p][1], [255, 255, 255]);
        }

        this.draw4Dlines(projected);
        this.draw4Dfaces(projected);
        angle += 1;

        if (angle >= 360) {
            angle = 0;
        }
    }

    // Build a simple rotation matrix for the XY axis
    getRotXY(ang) {
        // The angle has to be in radians
        let a = Math.cos(toRadians(ang));
        let b = Math.sin(toRadians(ang));
        let rot = [];
        rot.push([a, -b, 0, 0]);
        rot.push([b,  a, 0, 0]);
        rot.push([0,  0, 1, 0]);
        rot.push([0,  0, 0, 1]);
        return rot;
    }

    // And the XZ axis
    getRotXZ(ang) {
        let a = Math.cos(toRadians(ang));
        let b = Math.sin(toRadians(ang));
        let rot = [];
        rot.push([ a, 0, b, 0]);
        rot.push([ 0, 1, 0, 0]);
        rot.push([-b, 0, a, 0]);
        rot.push([0,  0, 0, 1]);
        return rot;
    }

    // And the YZ axis
    getRotYZ(ang) {
        let a = Math.cos(toRadians(ang));
        let b = Math.sin(toRadians(ang));
        let rot = [];
        rot.push([1, 0, 0, 0]);
        rot.push([0, a,-b, 0]);
        rot.push([0, b, a, 0]);
        rot.push([0, 0, 0, 1]);
        return rot;
    }

    // And the XW axis
    getRotXW(ang) {
        let a = Math.cos(toRadians(ang));
        let b = Math.sin(toRadians(ang));
        let rot = [];
        rot.push([a, 0, 0,-b]);
        rot.push([0, 1, 0, 0]);
        rot.push([0, 0, 1, 0]);
        rot.push([b, 0, 0, a]);
        return rot;
    }

    // And the YW axis
    getRotYW(ang) {
        let a = Math.cos(toRadians(ang));
        let b = Math.sin(toRadians(ang));
        let rot = [];
        rot.push([1, 0, 0, 0]);
        rot.push([0, a, 0,-b]);
        rot.push([0, 0, 1, 0]);
        rot.push([0, b, 0, a]);
        return rot;
    }

    // And the ZW axis
    getRotZW(ang) {
        let a = Math.cos(toRadians(ang));
        let b = Math.sin(toRadians(ang));
        let rot = [];
        rot.push([1, 0, 0, 0]);
        rot.push([0, 1, 0, 0]);
        rot.push([0, 0, a,-b]);
        rot.push([0, 0, b, a]);
        return rot;
    }

    // Get the perspective transform of a 4D vertex
    persp4D (rotated) {
        let distance = 2.5;
        let w = 1 / (distance - rotated[3]);
        let matrix = [];
        matrix.push([w, 0, 0, 0]);
        matrix.push([0, w, 0, 0]);
        matrix.push([0, 0, w, 0]);
        matrix.push([0, 0, 0, 0]);
        return matrix;
    }

    // Get the perspective transform of a 3D vertex
    persp3D (rotated) {
        let distance = 2.5;
        let z = 1 / (distance - rotated[2]);
        let matrix = [];
        matrix.push([z, 0, 0, 0]);
        matrix.push([0, z, 0, 0]);
        matrix.push([0, 0, z, 0]);
        matrix.push([0, 0, 0, 0]);
        return matrix;
    }

    // Draw the edges of a 4D tesseract
    draw4Dlines (p) {
        // Using this, we can draw all of the edges from one to the next 
        // without repeating and without drawing over any one twice 
        // (we can't do that with a cube)
        let disp = [0, 1, 3, 2, 6, 14, 10, 8, 9, 11, 3, 7, 15, 14, \
        12, 13, 9, 1, 5, 7, 6, 4, 12, 8, 0, 4, 5, 13, 15, 11, 10, 2, 0];
		
        // Start a new drawing
        let s = [0, 0];
        let e = [0, 0];
        let start = 0;
        disp.forEach(function (line) {
            if (start == 1) {
                s[0] = e[0];
                s[1] = e[1];
                e[0] = p[line][0];
                e[1] = p[line][1];
                drawLine(s[0], s[1], e[0], e[1], [0, 0, 0, 0]);
            } else {
                start = 1;
                e[0] = p[line][0];
                e[1] = p[line][1];
            }
        });
    }

    // Draw the faces of a 4D tesseract
    draw4Dfaces (p) {
        // Get the order of the vertices in the quads
        let disp = [
            [ 0,  1,  3,  2],   // quad inner back
            [ 2,  6, 14, 10],   // quad connect bottom of the left side
            [10,  8,  9, 11],   // quad inner front
            [11,  3,  7, 15],   // quad connect bottom of the right side
            [15, 14, 12, 13],   // quad near outer side 
            [13,  9,  1,  5],   // quad connect top of the right side
            [ 5,  7,  6,  4],   // quad far outer side
            [ 4, 12,  8,  0],   // quad connect top of the left side 
            [ 0,  1,  5,  4],   // quad connect top of the back
            [ 1,  3,  7,  5],   // quad connect right rear
            [ 3,  2,  6,  7],   // quad connect bottom rear
            [ 0,  2,  6,  4],   // quad connect left rear
            [ 8, 10, 14, 12],   // quad connect front left
            [ 9, 13, 12,  8],   // quad connect front top
            [ 9, 11, 15, 13],   // quad connect front right
            [10, 14, 15, 11],   // quad connect the front bottom 
            [ 1,  0,  8,  9],   // quad top of the inner cube
            [ 3,  1,  9, 11],   // quad right side of the inner cube
            [ 2, 10, 11,  3],   // quad bottom of the inner cube
            [ 0,  2, 10,  8],   // quad left side of the inner cube
            [14, 12,  4,  6],   // quad left side of the outer cube
            [13,  5,  4, 12],   // quad top of the outer cube
            [ 7, 15, 13,  5],   // quad right side outer cube
            [ 6, 14, 15,  7]    // quad for the bottom of the outer cube
        ];
        let a, b, c, d;
        a = b = c = d = [];
        disp.forEach (function (face, index) {
            let colour = [];
            if (index < 4) {
                // First four faces are coloured red
                colour = [200, 0, 0, 60];
            } else {
                if (index < 8) {
                    // next 4 faces are coloured yellow
                    colour = [200, 200, 0, 60];
                } else {
                    if (index < 11) {
                        // Next four faces are coloured green
                        colour = [0, 200, 0, 60];
                    } else {
                        if (index < 16) {
                            // Next four faces are coloured cyan
                            colour = [0, 200, 200, 60];
                        } else {
                            if (index < 20) {
                                // The next four faces are coloured blue
                                colour = [0, 0, 200, 60];
                            } else {
                                // And all the rest are coloured purple
                                colour = [200, 0, 200, 60];
                            }
                        }
                    }
                }
            }
            a = [p[face[0]][0], p[face[0]][1]];
            b = [p[face[1]][0], p[face[1]][1]];
            c = [p[face[2]][0], p[face[2]][1]];
            d = [p[face[3]][0], p[face[3]][1]];
            drawFilledQuad(a[0], a[1], b[0], b[1], c[0], c[1], d[0], d[1], colour);
        });
    }
};

// There isn't a Math function for this already, with javascript
// Convert radians to degrees
function toRadians(degrees) {
    return degrees * (Math.PI / 180.0); 
}

// A few global variables
let win_context;
let win;
let angle = 30;

// Draws a little circle around the vertex
function drawVertices (x, y, colour) {
    let colourString = "#" + colour[0].toString().padStart(2, "0");
    colourString += colour[1].toString(16).padStart(2, "0"); 
    colourString += colour[2].toString(16).padStart(2, "0");
    win_context.beginPath();
    win_context.arc(x, y, 2, 2 * Math.PI, false);
    win_context.lineWidth = '1';
    win_context.strokeStyle = colourString;
    win_context.stroke();
}

// This is the start of our line drawing function
function drawLine (x1, y1, x2, y2, colour) {
    let colourString = "#" + colour[0].toString(16).padStart(2, "0");
    colourString += colour[1].toString(16).padStart(2, "0"); 
    colourString += colour[2].toString(16).padStart(2, "0");
    win_context.beginPath();
    win_context.lineWidth = '1';
    win_context.strokeStyle = colourString;
    win_context.moveTo(x1, y1);
    win_context.lineTo(x2, y2);
    win_context.stroke();
}

// And this is the fully javascript version of the face drawing function
function drawFilledQuad (x1, y1, x2, y2, x3, y3, x4, y4, colour) {
    let colourString = "#" + colour[0].toString(16).padStart(2, "0"); 
    colourString += colour[1].toString(16).padStart(2, "0"); 
    colourString += colour[2].toString(16).padStart(2, "0");
    colourString += colour[3].toString(16).padStart(2, "0");
    win_context.beginPath();
    win_context.fillStyle = colourString; 
    win_context.moveTo(x1, y1);
    win_context.lineTo(x2, y2);
    win_context.lineTo(x3, y3);
    win_context.lineTo(x4, y4);
    win_context.fill();
}

// Multiply a vertex with a scale factor
function vert_scale_mult (v, sf) {
    for (let i = 0; i < v.length; i++) {
        v[i] *= sf;
    }
    return v;
}

// Turn a vertex sideways to be a matrix
// We need to do this to multiply them
// A "vertex" looks like this:
// vertex[x, y, z, w]
// but we want it to be:
// matrix [
//  [x],
//  [y],
//  [z],
//  [w]
// ]
function vert_to_matrix(vert) {
    let m = [];
    for (let i = 0; i < vert.length; i++) {
        m.push([vert[i]]);
    }
    return m;
}

// Turn a matrix back into a vertex
function matrix_to_vert(m) {
    let v = [];
    m.forEach (function (val) {
        v.push(val[0]);
    }); 
    return v;
}

// Multiply a matrix with a vertex
// returns a 1 x n array (a vertex)
function mat_mul_vert (mat_a, vert_b) {
    return matrix_to_vert(mat_mul(mat_a, vert_to_matrix(vert_b)));
}

// mutiply matrix a by matrix b for a new resulting matrix
// take in two matrices, and returns a third matrix
function mat_mul (a, b) {
    rowA = a.length;
    rowB = b.length;
    colA = a[0].length;
    colB = b[0].length;

    let result = [];
    for (let t = 0; t < 4; t++) {
        result.push([0, 0, 0, 0]);
    }

    for (let i = 0; i < rowA; i++) {
        for (let j = 0; j < colB; j++) {
            for (k = 0; k < rowB; k++) {
                result[i][j] += a[i][k] * b[k][j];
            }
        }
    }
    return result;
}

// And a function that starts everything going
function whenReady () {
    // First, lets start with some js specific code,
    // that will address the html file that we put this into
    win = document.getElementById("canvas3d");  // win is the window of the canvas
    win_context = win.getContext("2d");         // an object that gets us information about the win

    // Create a new tesseract object
    tess = new Tesseract(win);

    // And animate it rotating in place
    setInterval(function () {
        tess.doTesseract();
    }, 30, tess);
}
```