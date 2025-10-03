// Minimaltest: Zeichne "Hallo Welt" ins Canvas
window.onload = function() {
  var canvas = document.getElementById('gameCanvas');
  var ctx = canvas.getContext('2d');
  ctx.fillStyle = '#fff';
  ctx.font = '48px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Hallo Welt', canvas.width/2, canvas.height/2);
};
