/**
 * Lógica principal del juego. Mantiene la grilla, posición del jugador y puntajes.
 * @module game
 */

import { GRID_CONFIG, INITIAL_INVENTORY, BIOMES } from './config.js';
import * as audio from './audio.js';
import * as ui from './ui.js';
import * as renderer from './renderer.js';
import { StoneProjectile } from './entities.js';

export let grid = [];

export let state = {
    currentBiomeIndex: 0,
    currentLevel: 1,
    gold: 0,
    lives: 2,
    extraHearts: 0,
    totalMines: 12,
    gameState: 'START',
    activeTool: 'explore',
    levelStartTime: 0,
    levelElapsedTime: 0,
    completedLevelTimes: [null, null, null, null, null],
    totalScore: 0,
    completedLevelPoints: [0, 0, 0, 0, 0],

    bossActive: false,
    bossHp: 0,
    bossMaxHp: 0,
    bossName: '',
    bossLastAttackTime: 0,
    bossAttackInterval: 12000,
    bossProjectiles: [],

    bossLastActiveAttackTime: 0,
    bossActiveAttackInterval: 5000,
    bossWarnings: [],
    volcanicFires: [],
    speedBoostActive: false,
    rootedUntil: 0,
    slowedUntil: 0,
    frozenUntil: 0,
    immunityUntil: 0,

    shopInventory: JSON.parse(JSON.stringify(INITIAL_INVENTORY)),
    selectedActiveItem: null
};

export const frog = {
    name: 'Ranulfo',
    col: -1,
    row: -1,
    animX: 0,
    animY: 0,
    isSpawned: false,
    path: [],
    isMoving: false,
    speed: 0.28,
    state: 'idle',
    direction: 'right'
};

export function initGrid() {
    grid = [];
    for (let c = 0; c < GRID_CONFIG.cols; c++) {
        grid[c] = [];
        for (let r = 0; r < GRID_CONFIG.rows; r++) {
            grid[c][r] = {
                isMine: false, isHeart: false, isCoin: false, isStone: false, stoneActivated: false,
                neighborMines: 0, visited: false, flagged: false, exploded: false, coinCollected: false,
                heartCollected: false, animDepth: GRID_CONFIG.depthHeight,
                isChest: false, chestCollected: false,
                isTrap: false, trapTriggered: false
            };
        }
    }
}

export function generateBoard(firstClickedCol, firstClickedRow) {
    initGrid();

    state.bossWarnings = [];
    state.volcanicFires = [];
    state.speedBoostActive = false;
    state.rootedUntil = 0;
    state.slowedUntil = 0;
    state.frozenUntil = 0;
    state.immunityUntil = 0;
    state.bossLastActiveAttackTime = Date.now();
    state.bossActiveAttackInterval = Math.max(3000, 6000 - state.currentBiomeIndex * 500);

    if (state.currentLevel === 5) {
        state.bossActive = true;
        const bossNames = ["Caimán del Fango", "Serpiente de Vides", "Escorpión de Arena", "Megadrón de Asfalto", "Abominable Yeti", "Dragón de Obsidiana"];
        state.bossName = bossNames[state.currentBiomeIndex] || "Jefe Supremo";
        state.bossMaxHp = 6 + state.currentBiomeIndex * 2;
        state.bossHp = state.bossMaxHp;
        state.bossLastAttackTime = Date.now();
        state.bossAttackInterval = Math.max(5000, 12000 - state.currentBiomeIndex * 1500);
        state.bossProjectiles = [];
        audio.setBossMode(true);
    } else {
        state.bossActive = false;
        state.bossHp = 0;
        state.bossProjectiles = [];
        audio.setBossMode(false);
    }

    let placedMines = 0;
    while (placedMines < state.totalMines) {
        const randC = Math.floor(Math.random() * GRID_CONFIG.cols);
        const randR = Math.floor(Math.random() * GRID_CONFIG.rows);
        const distanceToStart = Math.max(Math.abs(randC - firstClickedCol), Math.abs(randR - firstClickedRow));
        if (distanceToStart > 1 && !grid[randC][randR].isMine) {
            grid[randC][randR].isMine = true;
            placedMines++;
        }
    }

    let heartPlaced = false;
    while (!heartPlaced) {
        const randC = Math.floor(Math.random() * GRID_CONFIG.cols);
        const randR = Math.floor(Math.random() * GRID_CONFIG.rows);
        if (!grid[randC][randR].isMine && Math.max(Math.abs(randC - firstClickedCol), Math.abs(randR - firstClickedRow)) > 1) {
            grid[randC][randR].isHeart = true;
            heartPlaced = true;
        }
    }

    const totalCoinsToPlace = 3 + Math.floor(Math.random() * 4);
    let coinsPlaced = 0;
    while (coinsPlaced < totalCoinsToPlace) {
        const randC = Math.floor(Math.random() * GRID_CONFIG.cols);
        const randR = Math.floor(Math.random() * GRID_CONFIG.rows);
        if (!grid[randC][randR].isMine && !grid[randC][randR].isHeart && Math.max(Math.abs(randC - firstClickedCol), Math.abs(randR - firstClickedRow)) > 1) {
            grid[randC][randR].isCoin = true;
            coinsPlaced++;
        }
    }

    if (state.currentLevel === 5) {
        let stonesToPlace = state.bossMaxHp;
        let stonesPlaced = 0;
        while (stonesPlaced < stonesToPlace) {
            const randC = Math.floor(Math.random() * GRID_CONFIG.cols);
            const randR = Math.floor(Math.random() * GRID_CONFIG.rows);
            if (!grid[randC][randR].isMine && !grid[randC][randR].isHeart && !grid[randC][randR].isCoin && !grid[randC][randR].isStone && Math.max(Math.abs(randC - firstClickedCol), Math.abs(randR - firstClickedRow)) > 1) {
                grid[randC][randR].isStone = true;
                stonesPlaced++;
            }
        }
    } else {
        // Generar 1 cofre
        let chestPlaced = false;
        while (!chestPlaced) {
            const randC = Math.floor(Math.random() * GRID_CONFIG.cols);
            const randR = Math.floor(Math.random() * GRID_CONFIG.rows);
            if (!grid[randC][randR].isMine && !grid[randC][randR].isHeart && !grid[randC][randR].isCoin && Math.max(Math.abs(randC - firstClickedCol), Math.abs(randR - firstClickedRow)) > 1) {
                grid[randC][randR].isChest = true;
                chestPlaced = true;
            }
        }

        // Generar 1 trampa
        let trapPlaced = false;
        while (!trapPlaced) {
            const randC = Math.floor(Math.random() * GRID_CONFIG.cols);
            const randR = Math.floor(Math.random() * GRID_CONFIG.rows);
            if (!grid[randC][randR].isMine && !grid[randC][randR].isHeart && !grid[randC][randR].isCoin && !grid[randC][randR].isChest && Math.max(Math.abs(randC - firstClickedCol), Math.abs(randR - firstClickedRow)) > 1) {
                grid[randC][randR].isTrap = true;
                trapPlaced = true;
            }
        }
    }

    for (let c = 0; c < GRID_CONFIG.cols; c++) {
        for (let r = 0; r < GRID_CONFIG.rows; r++) {
            if (grid[c][r].isMine) continue;
            let count = 0;
            for (let dc = -1; dc <= 1; dc++) {
                for (let dr = -1; dr <= 1; dr++) {
                    const nc = c + dc;
                    const nr = r + dr;
                    if (nc >= 0 && nc < GRID_CONFIG.cols && nr >= 0 && nr < GRID_CONFIG.rows) {
                        if (grid[nc][nr].isMine) count++;
                    }
                }
            }
            grid[c][r].neighborMines = count;
        }
    }
}

export function getGameProgress() {
    let safeTotal = 0;
    let safeRevealed = 0;
    for (let c = 0; c < GRID_CONFIG.cols; c++) {
        for (let r = 0; r < GRID_CONFIG.rows; r++) {
            if (!grid[c][r].isMine) {
                safeTotal++;
                if (grid[c][r].visited) safeRevealed++;
            }
        }
    }
    return { revealed: safeRevealed, total: safeTotal };
}

export function calculatePath(startCol, startRow, targetCol, targetRow) {
    if (startCol === targetCol && startRow === targetRow) return [];
    const queue = [[{ col: startCol, row: startRow }]];
    const visitedSet = new Set();
    visitedSet.add(`${startCol},${startRow}`);
    while (queue.length > 0) {
        const currentPath = queue.shift();
        const currentCell = currentPath[currentPath.length - 1];
        if (currentCell.col === targetCol && currentCell.row === targetRow) return currentPath;
        const directions = [{ dc: 0, dr: -1 }, { dc: 0, dr: 1 }, { dc: -1, dr: 0 }, { dc: 1, dr: 0 }];
        for (const d of directions) {
            const nextC = currentCell.col + d.dc;
            const nextR = currentCell.row + d.dr;
            if (nextC >= 0 && nextC < GRID_CONFIG.cols && nextR >= 0 && nextR < GRID_CONFIG.rows) {
                const key = `${nextC},${nextR}`;
                if (!visitedSet.has(key)) {
                    const tile = grid[nextC][nextR];
                    const isFinalStep = (nextC === targetCol && nextR === targetRow);
                    if (tile.visited || (isFinalStep && !tile.flagged)) {
                        visitedSet.add(key);
                        queue.push([...currentPath, { col: nextC, row: nextR }]);
                    }
                }
            }
        }
    }
    return [];
}

export function isTileOnFire(col, row) {
    return state.volcanicFires.some(f => f.col === col && f.row === row && Date.now() < f.endTime);
}

export function getFrogSpeed() {
    let baseSpeed = 0.28;
    if (state.speedBoostActive) baseSpeed = 0.45;
    if (Date.now() < state.slowedUntil) baseSpeed *= 0.5;
    return baseSpeed;
}

export function getSlidePath(startCol, startRow, targetCol, targetRow) {
    const dc = Math.sign(targetCol - startCol);
    const dr = Math.sign(targetRow - startRow);
    if (dc === 0 && dr === 0) return [];
    
    let path = [];
    let curC = startCol;
    let curR = startRow;
    
    while (true) {
        const nextC = curC + dc;
        const nextR = curR + dr;
        if (nextC < 0 || nextC >= GRID_CONFIG.cols || nextR < 0 || nextR >= GRID_CONFIG.rows) break;
        const tile = grid[nextC][nextR];
        if (tile.flagged) break;
        
        path.push({ col: nextC, row: nextR });
        curC = nextC;
        curR = nextR;
        
        if (!tile.visited) break;
    }
    return path;
}

export function pushFrogRandomly() {
    const directions = [{ dc: 0, dr: -1 }, { dc: 0, dr: 1 }, { dc: -1, dr: 0 }, { dc: 1, dr: 0 }];
    const validDirs = directions.filter(d => {
        const nc = frog.col + d.dc;
        const nr = frog.row + d.dr;
        return nc >= 0 && nc < GRID_CONFIG.cols && nr >= 0 && nr < GRID_CONFIG.rows && !grid[nc][nr].flagged;
    });
    if (validDirs.length > 0) {
        const d = validDirs[Math.floor(Math.random() * validDirs.length)];
        const nc = frog.col + d.dc;
        const nr = frog.row + d.dr;
        frog.col = nc;
        frog.row = nr;
        const sPos = renderer.gridToScreen(nc, nr);
        frog.animX = sPos.x;
        frog.animY = sPos.y;
        frog.path = [];
        frog.isMoving = false;
        ui.setStatusText("¡El torbellino te empujó!");
        onFrogSteppedOnCell(nc, nr);
    }
}

export function onFrogSteppedOnCell(col, row) {
    const tile = grid[col][row];
    tile.visited = true;
    ui.updateProgressUI();

    // Comprobar si hay lava en la baldosa
    if (isTileOnFire(col, row)) {
        const activeShield = state.shopInventory.find(i => i.id === 'shield');
        if (activeShield && activeShield.quantity > 0) {
            activeShield.quantity--;
            renderer.triggerScreenShake(15, 6);
            renderer.spawnExplosionParticles(frog.animX + GRID_CONFIG.cellSize / 2, frog.animY + GRID_CONFIG.cellSize / 2);
            audio.sfx.playExplosion();
            ui.updateInventoryUI();
            ui.setStatusText("¡Lava ardiente! El escudo te salvó.");
        } else {
            renderer.triggerScreenShake(20, 8);
            renderer.spawnExplosionParticles(frog.animX + GRID_CONFIG.cellSize / 2, frog.animY + GRID_CONFIG.cellSize / 2);
            audio.sfx.playExplosion();
            if (state.extraHearts > 0) state.extraHearts--; else state.lives--;
            ui.updateHeartsUI();
            ui.setStatusText("¡Quemado por la lava!");
            if (state.lives <= 0) { ui.triggerGameOver(); return; }
        }
    }

    if (tile.isMine && !tile.exploded) {
        const activeShield = state.shopInventory.find(i => i.id === 'shield');
        if (activeShield && activeShield.quantity > 0) {
            activeShield.quantity--;
            tile.exploded = true;
            renderer.triggerScreenShake(20, 8);
            renderer.spawnExplosionParticles(frog.animX + GRID_CONFIG.cellSize / 2, frog.animY + GRID_CONFIG.cellSize / 2);
            audio.sfx.playExplosion();
            ui.updateInventoryUI();
            frog.path = [];
            frog.isMoving = false;
            checkGameOverOrWin();
            return;
        }

        tile.exploded = true;
        renderer.triggerScreenShake(30, 14);
        renderer.spawnExplosionParticles(frog.animX + GRID_CONFIG.cellSize / 2, frog.animY + GRID_CONFIG.cellSize / 2);
        audio.sfx.playExplosion();

        if (state.extraHearts > 0) state.extraHearts--; else state.lives--;
        ui.updateHeartsUI();

        frog.path = [];
        frog.isMoving = false;

        if (state.lives <= 0) { ui.triggerGameOver(); return; }
    }

    if (tile.isHeart && !tile.heartCollected) {
        tile.heartCollected = true;
        if (state.lives < 2) state.lives = 2; else state.extraHearts++;
        ui.updateHeartsUI();
        audio.sfx.playHeart();
        renderer.spawnHeartParticles(frog.animX + GRID_CONFIG.cellSize / 2, frog.animY + GRID_CONFIG.cellSize / 2);
    }

    if (tile.isCoin && !tile.coinCollected) {
        tile.coinCollected = true;
        state.gold += 1;
        ui.updateGoldUI();
        audio.sfx.playCoin();
        renderer.spawnCoinParticles(frog.animX + GRID_CONFIG.cellSize / 2, frog.animY + GRID_CONFIG.cellSize / 2);
        ui.updateShopUI();
    }

    if (tile.isStone && !tile.stoneActivated) {
        tile.stoneActivated = true;
        const sPos = renderer.gridToScreen(col, row);
        state.bossProjectiles.push(new StoneProjectile(sPos.x + GRID_CONFIG.cellSize / 2, sPos.y + GRID_CONFIG.cellSize / 2 - tile.animDepth, 720, 220));
        audio.sfx.playStoneThrow();
    }

    if (tile.isChest && !tile.chestCollected) {
        tile.chestCollected = true;
        if (Math.random() < 0.5) {
            const goldGained = 3 + Math.floor(Math.random() * 3);
            state.gold += goldGained;
            ui.updateGoldUI();
            audio.sfx.playCoin();
            renderer.spawnCoinParticles(frog.animX + GRID_CONFIG.cellSize / 2, frog.animY + GRID_CONFIG.cellSize / 2);
            ui.setStatusText(`¡Cofre abierto! Ganaste ${goldGained} de oro.`);
        } else {
            const items = state.shopInventory;
            const chosenItem = items[Math.floor(Math.random() * items.length)];
            chosenItem.quantity++;
            audio.sfx.playHeart();
            renderer.spawnHeartParticles(frog.animX + GRID_CONFIG.cellSize / 2, frog.animY + GRID_CONFIG.cellSize / 2);
            ui.updateInventoryUI();
            ui.updateShopUI();
            ui.setStatusText(`¡Cofre abierto! Obtuviste: ${chosenItem.name}`);
        }
    }

    if (tile.isTrap && !tile.trapTriggered) {
        tile.trapTriggered = true;
        const activeShield = state.shopInventory.find(i => i.id === 'shield');
        if (activeShield && activeShield.quantity > 0) {
            activeShield.quantity--;
            renderer.triggerScreenShake(20, 8);
            renderer.spawnExplosionParticles(frog.animX + GRID_CONFIG.cellSize / 2, frog.animY + GRID_CONFIG.cellSize / 2);
            audio.sfx.playExplosion();
            ui.updateInventoryUI();
            ui.setStatusText("¡Trampa activada! El escudo te salvó.");
        } else {
            renderer.triggerScreenShake(25, 12);
            renderer.spawnExplosionParticles(frog.animX + GRID_CONFIG.cellSize / 2, frog.animY + GRID_CONFIG.cellSize / 2);
            audio.sfx.playExplosion();
            if (state.extraHearts > 0) state.extraHearts--; else state.lives--;
            ui.updateHeartsUI();
            ui.setStatusText("¡Trampa de flecha! Recibiste 1 de daño.");
            if (state.lives <= 0) { ui.triggerGameOver(); return; }
        }
    }

    checkGameOverOrWin();
}

export function checkGameOverOrWin() {
    if (state.gameState !== 'PLAYING') return;
    if (state.currentLevel === 5) {
        if (state.bossActive && state.bossHp <= 0) {
            audio.setBossMode(false);
            ui.triggerWinLevel();
        }
    } else {
        const progress = getGameProgress();
        if (progress.revealed === progress.total) ui.triggerWinLevel();
    }
}