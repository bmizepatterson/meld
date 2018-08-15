var canvas = document.getElementsByTagName('canvas')[0],
	ctx = canvas.getContext('2d');

// Utilities
function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

function draw() {
	ctx.clearRect(0,0,canvas.width,canvas.height);
}

function init() {
	canvas.height = 400;
	window.addEventListener('resize', resize);
	resize();
}

function resize() {
	canvas.width = window.innerWidth;
	if (window.innerHeight > canvas.height) {
		canvas.style.top = (window.innerHeight - canvas.height)/2+'px';
	} else {
		canvas.style.top = 0;
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