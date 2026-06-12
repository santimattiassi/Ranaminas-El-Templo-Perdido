/**
 * Entry point del juego.
 * @module main_module
 */

import * as config from './config.js';
import * as game from './game.js';
import * as renderer from './renderer.js';
import * as input from './input.js';
import * as ui from './ui.js';
import * as audio from './audio.js';

let lastAmbientPlayTime = 0;

function startEverything() {
    ui.initDOM();
    renderer.initCanvas(document.getElementById('game-canvas'));
    input.initInput(renderer.canvas);

    game.initGrid();
    ui.updateHeartsUI();
    ui.updateInventoryUI();
    ui.updateShopUI();
    ui.updateProgressUI();
    ui.updateLevelMapUI();

    window.selectInventoryItem = function(itemId) {
        const item = game.state.shopInventory.find(i => i.id === itemId);
        if (!item || item.quantity <= 0) return;
        if (item.type === 'shield') return;
        if (game.state.selectedActiveItem && game.state.selectedActiveItem.id === itemId) game.state.selectedActiveItem = null;
        else { game.state.selectedActiveItem = item; audio.sfx.playStep(); }
        ui.updateInventoryUI();
    };

    window.buyShopItem = function(itemId) {
        const item = game.state.shopInventory.find(i => i.id === itemId);
        if (!item || game.state.gold < item.cost) return;
        game.state.gold -= item.cost; item.quantity++;
        ui.updateGoldUI(); audio.sfx.playCoin(); ui.updateShopUI(); ui.updateInventoryUI();
    };

    window.restartGame = function() {
        game.state.currentBiomeIndex = 0; game.state.currentLevel = 1; game.state.gold = 0; game.state.lives = 2; game.state.extraHearts = 0; game.state.completedLevelTimes = [null, null, null, null, null];
        audio.setBiome(0); ui.updateGoldUI(); game.state.shopInventory.forEach(item => item.quantity = 0); game.state.selectedActiveItem = null;
        game.frog.isSpawned = false; game.frog.col = -1; game.frog.row = -1; game.frog.path = []; game.frog.isMoving = false; game.frog.state = 'idle';
        game.state.levelStartTime = 0; game.state.levelElapsedTime = 0; game.initGrid(); game.state.gameState = 'START';
        ui.hideOverlay(); ui.setStatusText("Clic donde quieras aparecer"); ui.updateHeartsUI(); ui.updateInventoryUI(); ui.updateShopUI(); ui.updateProgressUI(); ui.updateLevelMapUI();
    };

    window.advanceNextLevel = function() {
        if (game.state.currentLevel === 5) {
            game.state.currentBiomeIndex = (game.state.currentBiomeIndex + 1) % config.BIOMES.length; game.state.currentLevel = 1; game.state.completedLevelTimes = [null, null, null, null, null]; audio.setBiome(game.state.currentBiomeIndex);
        } else { game.state.currentLevel++; }
        if (game.state.currentLevel === 5) game.state.totalMines = 18; else game.state.totalMines = 11 + game.state.currentLevel;
        game.frog.isSpawned = false; game.frog.col = -1; game.frog.row = -1; game.frog.path = []; game.frog.isMoving = false; game.frog.state = 'idle';
        game.state.levelStartTime = 0; game.state.levelElapsedTime = 0; game.initGrid(); game.state.gameState = 'START';
        ui.hideOverlay(); ui.setStatusText("Clic donde quieras aparecer"); ui.updateProgressUI(); ui.updateShopUI(); ui.updateLevelMapUI();
    };

    requestAnimationFrame(mainLoop);
}

function mainLoop() {
    ui.updateTimerUI();

    if (game.state.gameState === 'PLAYING') {
        const now = Date.now();
        if (now - lastAmbientPlayTime > 6000) { lastAmbientPlayTime = now; audio.sfx.playBiomeAmbient(game.state.currentBiomeIndex); }

        if (game.state.bossActive && game.state.bossHp > 0) {
            if (now - game.state.bossLastAttackTime > game.state.bossAttackInterval) {
                game.state.bossLastAttackTime = now; audio.sfx.playBossRoar(); renderer.triggerScreenShake(40, 8);
                let candidates = [];
                for (let c = 0; c < config.GRID_CONFIG.cols; c++) {
                    for (let r = 0; r < config.GRID_CONFIG.rows; r++) {
                        const tile = game.grid[c][r];
                        if (tile.visited && !tile.isMine && !tile.isStone && !tile.heartCollected && !tile.coinCollected) {
                            if (c !== game.frog.col || r !== game.frog.row) candidates.push({ col: c, row: r });
                        }
                    }
                }
                if (candidates.length > 0) {
                    candidates.sort(() => Math.random() - 0.5);
                    const countToCover = Math.min(candidates.length, 2 + game.state.currentBiomeIndex);
                    for (let i = 0; i < countToCover; i++) {
                        const pos = candidates[i]; const tile = game.grid[pos.col][pos.row]; tile.visited = false; tile.animDepth = config.GRID_CONFIG.depthHeight;
                        const sPos = renderer.gridToScreen(pos.col, pos.row); renderer.spawnExplosionParticles(sPos.x + 24, sPos.y + 24);
                    }
                    ui.updateProgressUI();
                }
            }
        }
    }

    for (let i = renderer.bossProjectiles.length - 1; i >= 0; i--) {
        const proj = renderer.bossProjectiles[i];
        proj.update();
        if (proj.progress >= 1) {
            game.state.bossHp--; if (game.state.bossHp < 0) game.state.bossHp = 0;
            audio.sfx.playBossDamage(); renderer.triggerScreenShake(20, 6);
            import('./entities.js').then(module => { for(let k=0; k<12; k++) renderer.particles.push(new module.Particle(proj.targetX, proj.targetY, '#64748b', 'spark')); });
            renderer.bossProjectiles.splice(i, 1);
            if (game.state.bossHp <= 0) {
                game.state.bossActive = false;
                import('./entities.js').then(module => { for(let k=0; k<45; k++) renderer.particles.push(new module.Particle(proj.targetX, proj.targetY, '#fbbf24', 'spark')); });
                audio.sfx.playWin();
                const mins = Math.floor(game.state.levelElapsedTime / 60).toString().padStart(2, '0'); const secs = (game.state.levelElapsedTime % 60).toString().padStart(2, '0');
                game.state.completedLevelTimes[game.state.currentLevel - 1] = `${mins}:${secs}`; ui.updateLevelMapUI();
                setTimeout(() => { ui.triggerWinLevel(); }, 1000);
            }
        }
    }

    renderer.renderFrame(input.mouseHoveredCell, input.lastMouseX, input.lastMouseY);
    requestAnimationFrame(mainLoop);
}

if (document.readyState === 'complete' || document.readyState === 'interactive') startEverything(); else window.onload = startEverything;