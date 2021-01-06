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
	mode = 'drawRect',
	Shapes = [],
	currentShape = null,
	drawGrid = true,
	undoStack = [],
	redoStack = [],
	btnUndo = document.getElementById('undo'),
	btnRedo = document.getElementById('redo'),
	btnStrokeColor = document.getElementById('strokeColor');

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
	this.deleted = false;
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
		if (this.deleted) return;	// Don't draw deleted shapes
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
	this.delete = function() {
		this.deleted = true;
	}
	this.undelete = function() {
		this.deleted = false;
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
	document.getElementById('undo').addEventListener('click', undo);
	document.getElementById('redo').addEventListener('click', redo);
	resize();
}

function clickShapeRect() {
	document.getElementById('shapeRect').classList.toggle('selected');
	mode = (mode == 'drawRect') ? 'select' : 'drawRect';
}

function clickClearCanvas() {
	for (var i = 0; i < Shapes.length; i++) {
		Shapes[i].delete();
	}
	var operation = {
		name: 'clearCanvas',
		data: Shapes
	}
	undoStack.push(operation);
}

function clickSetGrid() {
	// Toggle drawGrid
	gridButton = document.getElementById('setGrid');
	gridButton.classList.toggle('selected');
	if (drawGrid) {
		drawGrid = false;
		gridButton.title = 'Turn on the grid';
	} else {
		drawGrid = true;
		gridButton.title = 'Turn off the grid';		
	}
}

function canvasMouseDown() {
	switch (mode) {
		case 'drawRect':
			currentShape = new Shape(mousePos.x, mousePos.y, mousePos.x, mousePos.y);
			break;
	}
}

function canvasMouseUp() {
	if (currentShape != null) {
		var operation = {
			name: 'addShape',
			data: currentShape
		};
		undoStack.push(operation);
	}
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
	// Last, draw mouse position as a point if we are in drawing mode
	if (mode != 'select' && mousePos.isset()) {
		drawPoint(mousePos.x + 0.5, mousePos.y + 0.5);
	}
	// Set toolbar buttons
	if (undoStack.length) {
		btnUndo.disabled = false;
		btnUndo.title = getDescription(undoStack[undoStack.length - 1]);
	} else {
		btnUndo.disabled = true;
	}
	if (redoStack.length) {
		btnRedo.disabled = false;
		btnRedo.title = getDescription(redoStack[redoStack.length - 1], false);
	} else {
		btnRedo.disabled = true;
	}
	if (!undoStack.length && !redoStack.length) {
		btnUndo.parentElement.style.display = "none";
	} else {
		btnUndo.parentElement.style.display = "block";
	}
	if (mode == 'drawRect') {
		btnStrokeColor.parentElement.style.display = "block";		
	} else {
		btnStrokeColor.parentElement.style.display = "none";		
	}
}


function resize() {
	canvas.height = window.innerHeight;
	canvas.width = window.innerWidth;
}

function undo() {
	var operation = undoStack.pop();
	switch (operation.name) {
		case "addShape":
			operation.data.delete();
			break;
		case "clearCanvas":
			for (let i = 0; i < operation.data.length; i++) {
				operation.data[i].undelete();
			}
			break;
		default:
			console.log('Attempted to undo an unrecognized operation.');
	}
	redoStack.push(operation);
}

function redo() {
	var operation = redoStack.pop();
	switch (operation.name) {
		case "addShape":
			operation.data.undelete();
			break;
		case "clearCanvas":
			for (let i = 0; i < operation.data.length; i++) {
				operation.data[i].delete();
			}
			break;
		default:
			console.log('Attempted to undo an unrecognized operation.');
	}
	undoStack.push(operation);
}

function getDescription(operation, undo=true) {
	// Returns a human-readable description of an operation
	var verb = undo ? "Undo " : "Redo ";
	switch (operation.name) {
		case 'addShape' 	: return verb + 'add shape';
		case 'clearCanvas'  : return verb + 'erase everything';
	}
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