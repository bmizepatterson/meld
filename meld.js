var canvas = document.getElementsByTagName('canvas')[0],
	ctx = canvas.getContext('2d'),
	spacing;

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
			y: y - wrapper.offsetTop - mousePosWatch.clientHeight};
}

function init() {
	canvas.height = 400;
	spacing = canvas.height / 20;
	window.addEventListener('resize', resize);
	canvas.addEventListener('mousemove', canvasMouseMove);
	resize();
}

function draw() {
	ctx.clearRect(0,0,canvas.width,canvas.height);
	// Draw grid
	ctx.lineStyle = 1;
	ctx.strokeStyle = '#CCC';
	for (var i = spacing + 0.5; i < canvas.height; i+=spacing) {
		drawLine(0, i, canvas.width, i);
	}
	for (var j = spacing + 0.5; j < canvas.width; j+=spacing) {
		drawLine(j, 0, j, canvas.height);	
	}
	if (mousePos.isset()) {
		drawPoint(mousePos.x + 0.5, mousePos.y + 0.5);
	}
}


function resize() {
	canvas.width = window.innerWidth;
	if (window.innerHeight > canvas.height) {
		wrapper.style.top = (window.innerHeight - wrapper.clientHeight)/2+'px';
	} else {
		wrapper.style.top = 0;
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