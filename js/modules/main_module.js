/**
 * Entry point del juego.
 * @module main_module
 */
import './synth.js';
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

        // Consumibles e Items de uso directo
        if (itemId === 'potion') {
            if (game.state.lives < 2) {
                game.state.lives++;
                item.quantity--;
                audio.sfx.playHeart();
                ui.updateHeartsUI();
                ui.setStatusText("¡Poción de Vida usada! Recuperaste 1 corazón.");
            } else {
                ui.setStatusText("¡Tu vida ya está al máximo!");
            }
            ui.updateInventoryUI();
            ui.updateShopUI();
            return;
        }

        if (itemId === 'boots') {
            game.state.speedBoostActive = true;
            item.quantity--;
            audio.sfx.playScan();
            ui.setStatusText("¡Botas de Velocidad activadas! Te mueves más rápido.");
            ui.updateInventoryUI();
            ui.updateShopUI();
            return;
        }

        if (itemId === 'elixir') {
            game.state.immunityUntil = Date.now() + 6000;
            item.quantity--;
            audio.sfx.playScan();
            ui.setStatusText("¡Elixir de Inmunidad activado! Eres invulnerable a jefes.");
            ui.updateInventoryUI();
            ui.updateShopUI();
            return;
        }

        if (itemId === 'magnifier') {
            let hiddenMines = [];
            for (let c = 0; c < config.GRID_CONFIG.cols; c++) {
                for (let r = 0; r < config.GRID_CONFIG.rows; r++) {
                    const tile = game.grid[c][r];
                    if (tile.isMine && !tile.flagged && !tile.visited) {
                        hiddenMines.push(tile);
                    }
                }
            }
            if (hiddenMines.length > 0) {
                const randomMine = hiddenMines[Math.floor(Math.random() * hiddenMines.length)];
                randomMine.flagged = true;
                item.quantity--;
                audio.sfx.playStep();
                renderer.triggerScreenShake(8, 2);
                ui.setStatusText("¡Lupa de Vidente usada! Se ha marcado una mina.");
            } else {
                ui.setStatusText("¡No quedan minas ocultas por marcar!");
            }
            ui.updateInventoryUI();
            ui.updateShopUI();
            return;
        }

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
        game.state.totalScore = 0; game.state.completedLevelPoints = [0, 0, 0, 0, 0];
        audio.setBiome(0); audio.setBossMode(false); ui.updateGoldUI(); ui.updateScoreUI(); game.state.shopInventory.forEach(item => item.quantity = 0); game.state.selectedActiveItem = null;
        game.frog.isSpawned = false; game.frog.col = -1; game.frog.row = -1; game.frog.path = []; game.frog.isMoving = false; game.frog.state = 'idle';
        game.state.levelStartTime = 0; game.state.levelElapsedTime = 0; game.initGrid(); game.state.gameState = 'START';
        ui.hideOverlay(); ui.setStatusText("Clic donde quieras aparecer"); ui.updateHeartsUI(); ui.updateInventoryUI(); ui.updateShopUI(); ui.updateProgressUI(); ui.updateLevelMapUI();
    };

    window.advanceNextLevel = function() {
        audio.setBossMode(false);
        if (game.state.currentLevel === 5) {
            game.state.currentBiomeIndex = (game.state.currentBiomeIndex + 1) % config.BIOMES.length; game.state.currentLevel = 1; game.state.completedLevelTimes = [null, null, null, null, null]; game.state.completedLevelPoints = [0, 0, 0, 0, 0]; audio.setBiome(game.state.currentBiomeIndex);
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
        game.frog.speed = game.getFrogSpeed();

        if (now - lastAmbientPlayTime > 6000) { lastAmbientPlayTime = now; audio.sfx.playBiomeAmbient(game.state.currentBiomeIndex); }

        if (game.state.bossActive && game.state.bossHp > 0) {
            // 1. Rugido pasivo
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

            // 2. Ataque activo telegrafiado
            if (now - game.state.bossLastActiveAttackTime > game.state.bossActiveAttackInterval) {
                game.state.bossLastActiveAttackTime = now;
                let targetCol = game.frog.col;
                let targetRow = game.frog.row;
                if (Math.random() < 0.3) {
                    let revealedCells = [];
                    for (let c = 0; c < config.GRID_CONFIG.cols; c++) {
                        for (let r = 0; r < config.GRID_CONFIG.rows; r++) {
                            if (game.grid[c][r].visited) revealedCells.push({ col: c, row: r });
                        }
                    }
                    if (revealedCells.length > 0) {
                        const chosen = revealedCells[Math.floor(Math.random() * revealedCells.length)];
                        targetCol = chosen.col;
                        targetRow = chosen.row;
                    }
                }

                if (targetCol !== -1 && targetRow !== -1) {
                    game.state.bossWarnings.push({
                        col: targetCol,
                        row: targetRow,
                        startTime: now,
                        duration: 1500,
                        type: game.state.currentBiomeIndex
                    });
                }
            }
        }

        // Procesar advertencias activas del jefe
        for (let i = game.state.bossWarnings.length - 1; i >= 0; i--) {
            const warning = game.state.bossWarnings[i];
            if (now - warning.startTime >= warning.duration) {
                const sPos = renderer.gridToScreen(warning.col, warning.row);
                renderer.spawnExplosionParticles(sPos.x + 24, sPos.y + 24);
                renderer.triggerScreenShake(20, 8);
                audio.sfx.playExplosion();

                const isImmune = now < game.state.immunityUntil;
                let isHit = false;
                if (warning.type === 3) { // Ciudad: cruz
                    isHit = (game.frog.col === warning.col || game.frog.row === warning.row);
                } else {
                    isHit = (game.frog.col === warning.col && game.frog.row === warning.row);
                }

                if (isHit && !isImmune) {
                    const activeShield = game.state.shopInventory.find(i => i.id === 'shield');
                    if (activeShield && activeShield.quantity > 0) {
                        activeShield.quantity--;
                        ui.updateInventoryUI();
                        ui.setStatusText("¡Escudo te protegió del ataque del Jefe!");
                    } else {
                        if (game.state.extraHearts > 0) game.state.extraHearts--; else game.state.lives--;
                        ui.updateHeartsUI();
                        ui.setStatusText("¡Recibiste daño del Jefe!");
                        
                        if (warning.type === 0) {
                            game.state.slowedUntil = now + 3000;
                            ui.setStatusText("¡Lodo Ácido! Estás ralentizado por 3s.");
                        } else if (warning.type === 1) {
                            game.state.rootedUntil = now + 2000;
                            ui.setStatusText("¡Enredado por vides! No puedes moverte por 2s.");
                        } else if (warning.type === 4) {
                            game.state.frozenUntil = now + 4000;
                            ui.setStatusText("¡Congelado! Te resbalas por 4s.");
                        }
                    }
                } else if (isHit && isImmune) {
                    ui.setStatusText("¡Elixir de Inmunidad te protegió del ataque!");
                }

                if (warning.type === 2 && !isImmune && isHit) {
                    game.pushFrogRandomly();
                } else if (warning.type === 5) {
                    game.state.volcanicFires.push({
                        col: warning.col,
                        row: warning.row,
                        endTime: now + 4000
                    });
                }

                game.state.bossWarnings.splice(i, 1);
                
                if (game.state.lives <= 0) {
                    ui.triggerGameOver();
                    break;
                }
            }
        }
    }

    for (let i = game.state.bossProjectiles.length - 1; i >= 0; i--) {
        const proj = game.state.bossProjectiles[i];
        proj.update();
        if (proj.progress >= 1) {
            game.state.bossHp--; if (game.state.bossHp < 0) game.state.bossHp = 0;
            audio.sfx.playBossDamage(); renderer.triggerScreenShake(20, 6);
            import('./entities.js').then(module => { for(let k=0; k<12; k++) renderer.particles.push(new module.Particle(proj.targetX, proj.targetY, '#64748b', 'spark')); });
            game.state.bossProjectiles.splice(i, 1);
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