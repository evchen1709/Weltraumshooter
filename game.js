\
const c = document.getElementById("game");
const ctx = c.getContext("2d");
const W = c.width, H = c.height;

// --- Input (Keyboard & Touch) ---
let keys = {};
addEventListener("keydown", e => { keys[e.code] = true; if(e.code==="Space") e.preventDefault(); });
addEventListener("keyup",   e => { keys[e.code] = false; });

let touch = { left:false, right:false, shoot:false };
// Simple touch zones
c.addEventListener("touchstart", e => handleTouch(e, true), {passive:false});
c.addEventListener("touchmove",  e => handleTouch(e, true), {passive:false});
c.addEventListener("touchend",   e => handleTouch(e, false), {passive:false});
function handleTouch(e, down){
  e.preventDefault();
  const rect = c.getBoundingClientRect();
  touch = { left:false, right:false, shoot:false };
  for(const t of e.touches){
    const x = (t.clientX - rect.left) / rect.width * W;
    const y = (t.clientY - rect.top) / rect.height * H;
    if(y > H*0.75){
      if(x < W*0.5) touch.left = true; else touch.right = true;
    } else {
      touch.shoot = true;
    }
  }
}

// --- Game State ---
let last = 0;
const player = { x: W/2-18, y: H-70, w: 36, h: 16, speed: 260, cd: 0 };
const bullets = [];
const enemies = [];
let score = 0;

function spawnWave(){
  const cols = 6, rows = 3, gapX = 60, gapY = 50;
  const startX = (W - (cols-1)*gapX)/2;
  for(let r=0;r<rows;r++){
    for(let i=0;i<cols;i++){
      enemies.push({ x:startX+i*gapX-16, y: 80+r*gapY, w:32, h:18, vx: (Math.random()<.5?1:-1)*30, hp:1 });
    }
  }
}
spawnWave();

// --- Loop ---
function loop(ts){
  const dt = Math.min(0.033, (ts - last)/1000 || 0); last = ts;
  update(dt); draw(); requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

// --- Update ---
function update(dt){
  // Player movement (keyboard or touch)
  let dx = 0;
  if(keys["ArrowLeft"] || keys["KeyA"] || touch.left) dx -= 1;
  if(keys["ArrowRight"]|| keys["KeyD"] || touch.right) dx += 1;
  player.x = Math.max(0, Math.min(W - player.w, player.x + dx * player.speed * dt));

  // Shooting
  player.cd -= dt;
  if((keys["Space"] || keys["KeyW"] || keys["ArrowUp"] || touch.shoot) && player.cd <= 0){
    bullets.push({ x: player.x + player.w/2 - 2, y: player.y - 10, w:4, h:10, vy:-520 });
    player.cd = 0.18;
  }

  // Bullets
  for(const b of bullets){ b.y += b.vy * dt; }
  for(let i=bullets.length-1;i>=0;i--) if(bullets[i].y < -20) bullets.splice(i,1);

  // Enemies
  for(const e of enemies){
    e.x += e.vx * dt;
    if(e.x < 10 || e.x+e.w > W-10){ e.vx *= -1; e.y += 10; }
  }

  // Collisions
  for(let i=enemies.length-1;i>=0;i--){
    const e = enemies[i];
    for(let j=bullets.length-1;j>=0;j--){
      const b = bullets[j];
      if(!(e.x+e.w<b.x || b.x+b.w<e.x || e.y+e.h<b.y || b.y+b.h<e.y)){
        bullets.splice(j,1);
        if(--e.hp<=0){ enemies.splice(i,1); score+=10; }
        break;
      }
    }
  }

  // Respawn wave
  if(enemies.length===0) spawnWave();
}

// --- Draw ---
function draw(){
  // Background
  ctx.fillStyle = "#050713";
  ctx.fillRect(0,0,W,H);

  // Stars (simple twinkle)
  const t = performance.now()/1000;
  for(let i=0;i<80;i++){
    const x = (i*53 % W);
    const y = (i*97 % H);
    const s = 0.5 + 0.5*Math.sin(t*2 + i);
    ctx.globalAlpha = 0.3 + 0.7*s;
    ctx.fillStyle = "#9bb3ff";
    ctx.fillRect(x, y, 2, 2);
  }
  ctx.globalAlpha = 1;

  // Player (triangle ship)
  ctx.fillStyle = "#6bdcff";
  ctx.fillRect(player.x, player.y, player.w, player.h);
  ctx.beginPath();
  ctx.moveTo(player.x, player.y);
  ctx.lineTo(player.x+player.w/2, player.y-10);
  ctx.lineTo(player.x+player.w, player.y);
  ctx.closePath();
  ctx.fill();

  // Bullets
  ctx.fillStyle = "#ffd166";
  for(const b of bullets){ ctx.fillRect(b.x, b.y, b.w, b.h); }

  // Enemies
  ctx.fillStyle = "#ff6b6b";
  for(const e of enemies){
    ctx.fillRect(e.x, e.y, e.w, e.h);
    ctx.fillRect(e.x+6, e.y-6, e.w-12, 6); // little antenna
  }

  // Score
  ctx.fillStyle = "#e7ecff";
  ctx.font = "16px system-ui, Arial";
  ctx.fillText("Punkte: " + score, 12, 22);
}
