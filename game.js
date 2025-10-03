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
// --- Gegner erstellen ---
function createEnemy() {
    const enemyTypes = ['fighter', 'scout', 'cruiser'];
    let type = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
    if (gameState.wave % 5 === 0 && Math.random() < 0.3) type = 'boss';
    const enemy = document.createElement('div');
    enemy.className = 'enemy';
    let width, height, hp, speed, fireRate, points;
    switch(type) {
        case 'scout': width = height = 35; hp = 1; speed = 4; fireRate = 2000; points = 150; break;
        case 'cruiser': width = height = 65; hp = 3; speed = 1; fireRate = 1000; points = 300; break;
        case 'boss': width = height = 80; hp = 8; speed = 0.5; fireRate = 800; points = 1000; break;
        default: width = height = 50; hp = 2; speed = 2; fireRate = 1500; points = 100;
    }
    enemy.style.width = width + 'px';
    enemy.style.height = height + 'px';
    const x = Math.random() * (window.innerWidth - width);
    enemy.style.left = x + 'px';
    enemy.style.top = '0px';
    const timestamp = Date.now();
    // SVG je nach Typ (gekürzt, siehe Original für Details)
    if(type==='scout') enemy.innerHTML = `<svg viewBox="0 0 35 35" xmlns="http://www.w3.org/2000/svg"><ellipse cx="17.5" cy="17.5" rx="5" ry="12" fill="#00ff88" stroke="#fff" stroke-width="1"/></svg>`;
    else if(type==='cruiser') enemy.innerHTML = `<svg viewBox="0 0 65 65" xmlns="http://www.w3.org/2000/svg"><ellipse cx="32.5" cy="32.5" rx="12" ry="20" fill="#8844ff" stroke="#fff" stroke-width="2"/></svg>`;
    else if(type==='boss') enemy.innerHTML = `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg"><ellipse cx="40" cy="40" rx="15" ry="25" fill="#ff0088" stroke="#fff" stroke-width="2"/></svg>`;
    else enemy.innerHTML = `<svg viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg"><ellipse cx="25" cy="25" rx="8" ry="15" fill="#ff4444" stroke="#fff" stroke-width="1"/></svg>`;
    gameContainer.appendChild(enemy);
    gameState.enemies.push({element: enemy, x: x, y: 0, lastShot: Date.now(), type: type, hp: hp, maxHp: hp, speed: speed, fireRate: fireRate, points: points, width: width, height: height});
}

function createPowerup() {
    const powerupTypes = ['double', 'rapid', 'shield'];
    const type = powerupTypes[Math.floor(Math.random() * powerupTypes.length)];
    const powerup = document.createElement('div');
    powerup.className = `powerup powerup-${type}`;
    const x = Math.random() * (window.innerWidth - 30);
    powerup.style.left = x + 'px';
    powerup.style.top = '0px';
    powerup.innerHTML = `<svg viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg"><circle cx="15" cy="15" r="12" fill="#ffaa00"/></svg>`;
    gameContainer.appendChild(powerup);
    gameState.powerups.push({element: powerup, x: x, y: 0, type: type});
}

function activatePowerup(type) {
    const duration = 10000;
    if(type==='double'){gameState.doubleShot=true;gameState.doubleShotTimer=Date.now()+duration;}
    if(type==='rapid'){gameState.rapidFire=true;gameState.rapidFireTimer=Date.now()+duration;}
    if(type==='shield'){
        if(!gameState.shield){gameState.shield=true;gameState.shieldTimer=Date.now()+duration;const shield=document.createElement('div');shield.className='player-shield';player.appendChild(shield);gameState.shieldElement=shield;}
        else{gameState.shieldTimer=Date.now()+duration;}
    }
    updatePowerupStatus();
}

function updatePowerupStatus() {
    const statusElement = document.getElementById('powerupStatus');
    let statusHTML = '';
    if (gameState.doubleShot) statusHTML += `<div>⚡⚡ Doppelschuss</div>`;
    if (gameState.rapidFire) statusHTML += `<div>▲▲▲ Schnellfeuer</div>`;
    if (gameState.shield) statusHTML += `<div>◆ Schild</div>`;
    statusElement.innerHTML = statusHTML;
}

function enemyShoot(enemy) {
    if (Date.now() - enemy.lastShot > enemy.fireRate + Math.random() * 500) {
        const centerX = enemy.x + enemy.width / 2;
        const bullet = document.createElement('div');
        bullet.className = 'enemy-bullet';
        bullet.style.left = (centerX - 2) + 'px';
        bullet.style.top = (enemy.y + enemy.height) + 'px';
        gameContainer.appendChild(bullet);
        gameState.enemyBullets.push({element: bullet, x: centerX - 2, y: enemy.y + enemy.height});
        enemy.lastShot = Date.now();
    }
}

function createExplosion(x, y, size = 'normal') {
    const explosion = document.createElement('div');
    explosion.className = 'explosion';
    let explosionSize = 80;
    if (size === 'small') explosionSize = 50;
    if (size === 'large') explosionSize = 120;
    if (size === 'boss') explosionSize = 150;
    explosion.style.width = explosionSize + 'px';
    explosion.style.height = explosionSize + 'px';
    explosion.style.left = (x - explosionSize/2) + 'px';
    explosion.style.top = (y - explosionSize/2) + 'px';
    explosion.style.transform = `rotate(${Math.random() * 360}deg)`;
    gameContainer.appendChild(explosion);
    setTimeout(() => {if (explosion.parentNode) explosion.parentNode.removeChild(explosion);}, 800);
}

function checkCollisions() {
    // Spieler-Kugeln vs Gegner
    gameState.bullets.forEach((bullet, bulletIndex) => {
        gameState.enemies.forEach((enemy, enemyIndex) => {
            if (bullet.x > enemy.x && bullet.x < enemy.x + enemy.width && bullet.y > enemy.y && bullet.y < enemy.y + enemy.height) {
                bullet.element.remove();
                gameState.bullets.splice(bulletIndex, 1);
                enemy.hp--;
                createExplosion(bullet.x, bullet.y, 'small');
                if (enemy.hp <= 0) {
                    createExplosion(enemy.x + enemy.width/2, enemy.y + enemy.height/2, 'normal');
                    enemy.element.remove();
                    gameState.enemies.splice(enemyIndex, 1);
                    gameState.score += enemy.points;
                    scoreElement.textContent = gameState.score;
                    gameState.waveEnemiesLeft--;
                } else {
                    enemy.element.style.filter = 'brightness(2)';
                    setTimeout(() => {if (enemy.element.parentNode) enemy.element.style.filter = 'brightness(1)';}, 100);
                }
            }
        });
    });
    // Gegner-Kugeln vs Spieler
    gameState.enemyBullets.forEach((bullet, bulletIndex) => {
        if (bullet.x > gameState.playerX && bullet.x < gameState.playerX + 60 && bullet.y > window.innerHeight - 110 && bullet.y < window.innerHeight - 50) {
            bullet.element.remove();
            gameState.enemyBullets.splice(bulletIndex, 1);
            if (!gameState.shield) {
                createExplosion(gameState.playerX + 30, window.innerHeight - 80, 'normal');
                gameState.lives--;
                livesElement.textContent = gameState.lives;
                if (gameState.lives <= 0) gameOver();
            }
        }
    });
    // Gegner vs Spieler
    gameState.enemies.forEach((enemy, enemyIndex) => {
        if (enemy.x < gameState.playerX + 60 && enemy.x + enemy.width > gameState.playerX && enemy.y < window.innerHeight - 50 && enemy.y + enemy.height > window.innerHeight - 110) {
            createExplosion(enemy.x + enemy.width/2, enemy.y + enemy.height/2, 'normal');
            enemy.element.remove();
            gameState.enemies.splice(enemyIndex, 1);
            if (!gameState.shield) {
                createExplosion(gameState.playerX + 30, window.innerHeight - 80, 'normal');
                gameState.lives--;
                livesElement.textContent = gameState.lives;
                if (gameState.lives <= 0) gameOver();
            }
        }
    });
    // Power-Ups vs Spieler
    gameState.powerups.forEach((powerup, powerupIndex) => {
        if (powerup.x < gameState.playerX + 60 && powerup.x + 30 > gameState.playerX && powerup.y < window.innerHeight - 50 && powerup.y + 30 > window.innerHeight - 110) {
            activatePowerup(powerup.type);
            powerup.element.remove();
            gameState.powerups.splice(powerupIndex, 1);
            gameState.score += 50;
            scoreElement.textContent = gameState.score;
        }
    });
}

function updateGame() {
    if (!gameState.gameRunning) return;
    // Spieler-Kugeln bewegen
    gameState.bullets.forEach((bullet, index) => {
        bullet.y -= 12;
        bullet.element.style.bottom = (window.innerHeight - bullet.y) + 'px';
        if (bullet.y < 0) { bullet.element.remove(); gameState.bullets.splice(index, 1); }
    });
    // Gegner-Kugeln bewegen
    gameState.enemyBullets.forEach((bullet, index) => {
        bullet.y += 8;
        bullet.element.style.top = bullet.y + 'px';
        if (bullet.y > window.innerHeight) { bullet.element.remove(); gameState.enemyBullets.splice(index, 1); }
    });
    // Gegner bewegen
    gameState.enemies.forEach((enemy, index) => {
        enemy.y += enemy.speed;
        enemy.element.style.top = enemy.y + 'px';
        enemyShoot(enemy);
        if (enemy.y > window.innerHeight) { enemy.element.remove(); gameState.enemies.splice(index, 1); gameState.waveEnemiesLeft--; }
    });
    // Power-Ups bewegen
    gameState.powerups.forEach((powerup, index) => {
        powerup.y += 3;
        powerup.element.style.top = powerup.y + 'px';
        if (powerup.y > window.innerHeight) { powerup.element.remove(); gameState.powerups.splice(index, 1); }
    });
    // Neue Gegner spawnen
    if (gameState.waveEnemiesLeft > 0 && Date.now() - gameState.enemySpawnTimer > 2000) {
        createEnemy();
        gameState.enemySpawnTimer = Date.now();
    }
    // Power-Ups spawnen
    if (Date.now() - gameState.powerupSpawnTimer > 15000) {
        createPowerup();
        gameState.powerupSpawnTimer = Date.now();
    }
    // Power-Up Timer prüfen
    if (gameState.doubleShot && Date.now() > gameState.doubleShotTimer) gameState.doubleShot = false;
    if (gameState.rapidFire && Date.now() > gameState.rapidFireTimer) gameState.rapidFire = false;
    if (gameState.shield && Date.now() > gameState.shieldTimer) {
        gameState.shield = false;
        if (gameState.shieldElement) { gameState.shieldElement.remove(); gameState.shieldElement = null; }
    }
    updatePowerupStatus();
    // Nächste Welle
    if (gameState.waveEnemiesLeft <= 0 && gameState.enemies.length === 0) {
        gameState.wave++;
        gameState.waveEnemiesLeft = 5 + gameState.wave * 2;
        waveElement.textContent = gameState.wave;
    }
    checkCollisions();
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
