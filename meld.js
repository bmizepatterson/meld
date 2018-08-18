var canvas = document.getElementsByTagName('canvas')[0],
	ctx = canvas.getContext('2d'),
	statusBar = document.getElementById('statusBar'),
	mousePos = {
		x: null,
		y: null,
		set: function(x = null, y = null) {
			this.x = x; 
			this.y = y;
		},
		isset: function() {
			return (this.x !=null && this.y != null);
		}
	},
	spacing,
	Shapes = [],
	currentShape = null,
	drawGrid = true;

// Utilities
function snap(val) {
    return spacing * Math.round(val/spacing);
}
function drawLine(startX,startY,endX,endY) {
	ctx.beginPath();
	ctx.moveTo(startX, startY);
	ctx.lineTo(endX, endY);
	ctx.stroke();
}
function drawPoint(x,y,r=5,color='rgba(0,0,255,0.5') {
	ctx.beginPath();
	ctx.arc(x,y,r,0,2*Math.PI);
	ctx.fillStyle = color;
	ctx.fill();
}
function getMousePos(x,y) {
	return {x: x - wrapper.offsetLeft,
			y: y - wrapper.offsetTop};
}

// Objects
function Shape(x1, y1, x2, y2) {
	this.start = {
		x: x1,
		y: y1
	};
	this.end = {
		x: x2,
		y: y2
	};
	Shapes.push(this);
	this.draw = function(stroke = true, strokeStyle = '#000', lineWidth = 2, fill = false, fillStyle = '#000') {
		ctx.beginPath();
		ctx.rect(this.start.x, this.start.y, this.end.x-this.start.x, this.end.y-this.start.y);
		if (stroke) {
			ctx.strokeStyle = strokeStyle;
			ctx.lineWidth = 2;
			ctx.stroke();
		}
		if (fill) {
			ctx.fillStyle = fillStyle;
			ctx.fill();
		}
	}
}

function init() {
	canvas.height = window.innerHeight;
	canvas.width = window.innerWidth;
	spacing = Math.round(canvas.height / 20);
	window.addEventListener('resize', resize);
	canvas.addEventListener('mousemove', canvasMouseMove);
	canvas.addEventListener('mouseout', canvasMouseOut);
	canvas.addEventListener('mousedown', canvasMouseDown);
	canvas.addEventListener('mouseup', canvasMouseUp);
	document.getElementById('shapeRect').addEventListener('click', clickShapeRect);
	document.getElementById('clearCanvas').addEventListener('click', clickClearCanvas);
	document.getElementById('setGrid').addEventListener('click', clickSetGrid);
	resize();
}

function clickShapeRect() {
	document.getElementById('shapeRect').classList.toggle('selected');
}

function clickClearCanvas() {
	Shapes = [];
}

function clickSetGrid() {
	document.getElementById('setGrid').classList.toggle('selected');
	// Toggle drawGrid
	drawGrid = drawGrid ? false : true;
}

function canvasMouseDown() {
	currentShape = new Shape(mousePos.x, mousePos.y, mousePos.x, mousePos.y);
}

function canvasMouseUp() {
	currentShape = null;
}

function canvasMouseMove(e) {
	var realMousePos = getMousePos(e.x, e.y);
	mousePos.set(snap(realMousePos.x),snap(realMousePos.y));
	statusBar.innerHTML = 'Real: ('+realMousePos.x+', '+realMousePos.y+') Snapped: ('+mousePos.x+', '+mousePos.y+')';

	if (currentShape != null) {
		currentShape.end.x = mousePos.x;
		currentShape.end.y = mousePos.y;
	}
}

function canvasMouseOut(e) {
	mousePos.set();
	statusBar.innerHTML = '';
	currentShape = null;
}

function draw() {
	ctx.clearRect(0,0,canvas.width,canvas.height);
	// Draw grid
	if (drawGrid) {
		ctx.lineWidth = 1;
		ctx.strokeStyle = '#CCC';
		for (var i = spacing + 0.5; i < canvas.height; i+=spacing) {
			drawLine(0, i, canvas.width, i);
		}
		for (var j = spacing + 0.5; j < canvas.width; j+=spacing) {
			drawLine(j, 0, j, canvas.height);	
		}
	}
	// Draw all the shapes
	for (var k = 0; k < Shapes.length; k++) {
		Shapes[k].draw();
	}
	// Last, draw mouse position as a point
	if (mousePos.isset()) {
		drawPoint(mousePos.x + 0.5, mousePos.y + 0.5);
	}
}


function resize() {
	canvas.height = window.innerHeight;
	canvas.width = window.innerWidth;
}

window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          function( callback ) {
            window.setTimeout(callback, 1000 / 60);
          };
})();

function loop() {
  draw();
  requestAnimFrame(loop);
}

init();
loop();