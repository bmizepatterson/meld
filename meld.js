// Utilities
function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

function draw() {

}

function init() {

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