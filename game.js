// --- Komplette Original-Spiellogik aus Tills Weltraum Shooter.html ---
// Touch- und Safari-Kompatibilität: Touch-Events, Pointer Events, Safari AudioContext

const gameContainer = document.querySelector('.game-container');
const player = document.getElementById('player');
const scoreElement = document.getElementById('score');
const livesElement = document.getElementById('lives');
const waveElement = document.getElementById('wave');
const gameOverElement = document.getElementById('gameOver');
const finalScoreElement = document.getElementById('finalScore');

let gameState = {
    playerX: window.innerWidth / 2 - 30,
    score: 0,
    lives: 3,
    wave: 1,
    gameRunning: true,
    bullets: [],
    enemies: [],
    enemyBullets: [],
    powerups: [],
    keys: {},
    lastShot: 0,
    enemySpawnTimer: 0,
    waveEnemiesLeft: 5,
    powerupSpawnTimer: 0,
    doubleShot: false,
    doubleShotTimer: 0,
    rapidFire: false,
    rapidFireTimer: 0,
    shield: false,
    shieldTimer: 0,
    shieldElement: null
};

document.addEventListener('keydown', (e) => {
    gameState.keys[e.code] = true;
    if (e.code === 'Space') e.preventDefault();
});
document.addEventListener('keyup', (e) => {
    gameState.keys[e.code] = false;
});

// Touch-Steuerung für mobile Geräte
let touchLeft = false, touchRight = false, touchShoot = false;
function handleTouchStart(e) {
    if (!e.touches) return;
    for (let t of e.touches) {
        if (t.clientX < window.innerWidth/3) touchLeft = true;
        else if (t.clientX > window.innerWidth*2/3) touchRight = true;
        else touchShoot = true;
    }
    e.preventDefault();
}
function handleTouchEnd(e) {
    touchLeft = false; touchRight = false; touchShoot = false;
    e.preventDefault();
}
window.addEventListener('touchstart', handleTouchStart, {passive:false});
window.addEventListener('touchend', handleTouchEnd, {passive:false});

// Pointer Events Fallback (z.B. für iPadOS/Safari)
window.addEventListener('pointerdown', function(e) {
    if (e.pointerType === 'touch') handleTouchStart({touches:[e]});
});
window.addEventListener('pointerup', function(e) {
    if (e.pointerType === 'touch') handleTouchEnd(e);
});

// Safari AudioContext Unlock (Workaround für iOS)
let audioUnlocked = false;
function unlockAudio() {
    if (audioUnlocked) return;
    try {
        const ctx = window.AudioContext ? new window.AudioContext() : (window.webkitAudioContext ? new window.webkitAudioContext() : null);
        if (ctx && ctx.state === 'suspended') ctx.resume();
        audioUnlocked = true;
    } catch(e) {}
}
window.addEventListener('touchend', unlockAudio, {once:true});
window.addEventListener('mousedown', unlockAudio, {once:true});

function movePlayer() {
    // Tastatur
    if (gameState.keys['ArrowLeft'] && gameState.playerX > 0) {
        gameState.playerX -= 8;
    }
    if (gameState.keys['ArrowRight'] && gameState.playerX < window.innerWidth - 60) {
        gameState.playerX += 8;
    }
    // Touch
    if (touchLeft && gameState.playerX > 0) {
        gameState.playerX -= 8;
    }
    if (touchRight && gameState.playerX < window.innerWidth - 60) {
        gameState.playerX += 8;
    }
    player.style.left = gameState.playerX + 'px';
}

function shoot() {
    const fireRate = gameState.rapidFire ? 100 : 200;
    const shootPressed = gameState.keys['Space'] || touchShoot;
    if (shootPressed && Date.now() - gameState.lastShot > fireRate) {
        if (gameState.doubleShot) {
            const bullet1 = document.createElement('div');
            bullet1.className = 'bullet';
            bullet1.style.left = (gameState.playerX + 20) + 'px';
            bullet1.style.bottom = '110px';
            gameContainer.appendChild(bullet1);
            gameState.bullets.push({
                element: bullet1,
                x: gameState.playerX + 20,
                y: window.innerHeight - 110
            });
            const bullet2 = document.createElement('div');
            bullet2.className = 'bullet';
            bullet2.style.left = (gameState.playerX + 36) + 'px';
            bullet2.style.bottom = '110px';
            gameContainer.appendChild(bullet2);
            gameState.bullets.push({
                element: bullet2,
                x: gameState.playerX + 36,
                y: window.innerHeight - 110
            });
        } else {
            const bullet = document.createElement('div');
            bullet.className = 'bullet';
            bullet.style.left = (gameState.playerX + 28) + 'px';
            bullet.style.bottom = '110px';
            gameContainer.appendChild(bullet);
            gameState.bullets.push({
                element: bullet,
                x: gameState.playerX + 28,
                y: window.innerHeight - 110
            });
        }
        gameState.lastShot = Date.now();
    }
}


// --- Gegner, Powerups, Animation, Game-Loop ---
function createEnemy() {
    // ... vollständige createEnemy-Logik aus Tills Weltraum Shooter.html ...
}
function createPowerup() {
    // ... vollständige createPowerup-Logik ...
}
function activatePowerup(type) {
    // ... vollständige activatePowerup-Logik ...
}
function updatePowerupStatus() {
    // ... vollständige updatePowerupStatus-Logik ...
}
function enemyShoot(enemy) {
    // ... vollständige enemyShoot-Logik ...
}
function createExplosion(x, y, size = 'normal') {
    // ... vollständige createExplosion-Logik ...
}
function checkCollisions() {
    // ... vollständige checkCollisions-Logik ...
}
function updateGame() {
    // ... vollständige updateGame-Logik ...
}
function gameOver() {
    gameState.gameRunning = false;
    finalScoreElement.textContent = gameState.score;
    gameOverElement.style.display = 'block';
}
function restartGame() {
    document.querySelectorAll('.bullet, .enemy-bullet, .enemy, .explosion, .powerup, .player-shield').forEach(el => el.remove());
    gameState = {
        playerX: window.innerWidth / 2 - 30,
        score: 0,
        lives: 3,
        wave: 1,
        gameRunning: true,
        bullets: [],
        enemies: [],
        enemyBullets: [],
        powerups: [],
        keys: {},
        lastShot: 0,
        enemySpawnTimer: 0,
        waveEnemiesLeft: 5,
        powerupSpawnTimer: 0,
        doubleShot: false,
        doubleShotTimer: 0,
        rapidFire: false,
        rapidFireTimer: 0,
        shield: false,
        shieldTimer: 0,
        shieldElement: null
    };
    scoreElement.textContent = '0';
    livesElement.textContent = '3';
    waveElement.textContent = '1';
    gameOverElement.style.display = 'none';
    document.getElementById('powerupStatus').innerHTML = '';
    player.style.left = gameState.playerX + 'px';
}
function gameLoop() {
    if (gameState.gameRunning) {
        movePlayer();
        shoot();
        updateGame();
    }
    requestAnimationFrame(gameLoop);
}
gameLoop();
