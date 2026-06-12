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

    bossActive: false,
    bossHp: 0,
    bossMaxHp: 0,
    bossName: '',
    bossLastAttackTime: 0,
    bossAttackInterval: 12000,
    bossProjectiles: [],

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
                heartCollected: false, animDepth: GRID_CONFIG.depthHeight
            };
        }
    }
}

export function generateBoard(firstClickedCol, firstClickedRow) {
    initGrid();

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

export function onFrogSteppedOnCell(col, row) {
    const tile = grid[col][row];
    tile.visited = true;
    ui.updateProgressUI();

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