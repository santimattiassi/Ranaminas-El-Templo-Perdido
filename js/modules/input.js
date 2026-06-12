/**
 * Input handler
 * @module input
 */
import * as game from './game.js';
import * as audio from './audio.js';
import * as renderer from './renderer.js';
import * as ui from './ui.js';

export let mouseHoveredCell = { col: -1, row: -1 };
export let lastMouseX = 0;
export let lastMouseY = 0;

export function initInput(canvas) {
    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const mouseX = (e.clientX - rect.left) * scaleX;
        const mouseY = (e.clientY - rect.top) * scaleY;
        lastMouseX = mouseX; lastMouseY = mouseY;
        const hovered = renderer.screenToGrid(mouseX, mouseY);
        if (hovered) mouseHoveredCell = hovered; else mouseHoveredCell = { col: -1, row: -1 };
    });

    canvas.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        const rect = canvas.getBoundingClientRect(); const scaleX = canvas.width / rect.width; const scaleY = canvas.height / rect.height;
        const mouseX = (e.clientX - rect.left) * scaleX; const mouseY = (e.clientY - rect.top) * scaleY;
        const clicked = renderer.screenToGrid(mouseX, mouseY);
        if (!clicked || game.state.gameState !== 'PLAYING') return;
        const tile = game.grid[clicked.col][clicked.row];
        if (!tile.visited) { tile.flagged = !tile.flagged; audio.sfx.playStep(); }
    });

    canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect(); const scaleX = canvas.width / rect.width; const scaleY = canvas.height / rect.height;
        const mouseX = (e.clientX - rect.left) * scaleX; const mouseY = (e.clientY - rect.top) * scaleY;

        if (game.frog.isSpawned && game.state.gameState === 'PLAYING') {
            const frogCenterX = game.frog.animX + 24; const frogCenterY = game.frog.animY + 24 - 8;
            const dist = Math.hypot(mouseX - frogCenterX, mouseY - frogCenterY);
            if (dist < 22) { audio.sfx.playFrogSqueeze(); renderer.spawnHeartParticles(frogCenterX, frogCenterY); return; }
        }

        const clicked = renderer.screenToGrid(mouseX, mouseY);
        if (!clicked) return;

        if (game.state.selectedActiveItem) {
            if (game.state.selectedActiveItem.id === 'scanner') {
                game.state.selectedActiveItem.quantity--; game.state.selectedActiveItem = null;
                audio.sfx.playScan(); renderer.triggerScreenShake(8, 3);
                for (let dc = -1; dc <= 1; dc++) {
                    for (let dr = -1; dr <= 1; dr++) {
                        const nc = clicked.col + dc; const nr = clicked.row + dr;
                        if (nc >= 0 && nc < game.grid.length && nr >= 0 && nr < game.grid[0].length) {
                            game.grid[nc][nr].visited = true; game.grid[nc][nr].flagged = false;
                            if (game.grid[nc][nr].isCoin && !game.grid[nc][nr].coinCollected) { game.grid[nc][nr].coinCollected = true; game.state.gold += 1; ui.updateGoldUI(); }
                            if (game.grid[nc][nr].isHeart && !game.grid[nc][nr].heartCollected) { game.grid[nc][nr].heartCollected = true; if (game.state.lives < 2) game.state.lives = 2; else game.state.extraHearts++; ui.updateHeartsUI(); }
                            if (game.grid[nc][nr].isStone && !game.grid[nc][nr].stoneActivated) { game.grid[nc][nr].stoneActivated = true; const sPos = renderer.gridToScreen(nc, nr); renderer.bossProjectiles.push(new renderer.StoneProjectile(sPos.x + 24, sPos.y + 24 - game.grid[nc][nr].animDepth, 720, 220)); audio.sfx.playStoneThrow(); }
                        }
                    }
                }
                ui.updateInventoryUI(); ui.updateShopUI(); ui.updateProgressUI(); game.checkGameOverOrWin(); return;
            }
            if (game.state.selectedActiveItem.id === 'jump') {
                const distance = Math.max(Math.abs(game.frog.col - clicked.col), Math.abs(game.frog.row - clicked.row));
                if (distance > 2 || game.grid[clicked.col][clicked.row].flagged) return;
                game.state.selectedActiveItem.quantity--; game.state.selectedActiveItem = null;
                audio.sfx.playScan(); renderer.spawnCoinParticles(game.frog.animX + 24, game.frog.animY + 24);
                game.frog.col = clicked.col; game.frog.row = clicked.row;
                const targetScreenPos = renderer.gridToScreen(clicked.col, clicked.row); game.frog.animX = targetScreenPos.x; game.frog.animY = targetScreenPos.y; game.frog.path = []; game.frog.isMoving = false;
                game.onFrogSteppedOnCell(clicked.col, clicked.row); ui.updateInventoryUI(); ui.updateShopUI(); return;
            }
        }

        if (game.state.activeTool === 'flag' && game.state.gameState === 'PLAYING') {
            const tile = game.grid[clicked.col][clicked.row]; if (!tile.visited) { tile.flagged = !tile.flagged; audio.sfx.playStep(); } return;
        }

        if (game.grid[clicked.col][clicked.row].flagged) return;

        if (game.state.gameState === 'START') {
            game.state.gameState = 'PLAYING'; game.state.levelStartTime = Date.now(); game.generateBoard(clicked.col, clicked.row);
            game.frog.isSpawned = true; game.frog.col = clicked.col; game.frog.row = clicked.row;
            const pos = renderer.gridToScreen(clicked.col, clicked.row); game.frog.animX = pos.x; game.frog.animY = pos.y; game.frog.isMoving = false;
            ui.setStatusText("Viajando por el templo..."); game.onFrogSteppedOnCell(clicked.col, clicked.row); return;
        }

        if (game.state.gameState === 'PLAYING' && !game.frog.isMoving) {
            const path = game.calculatePath(game.frog.col, game.frog.row, clicked.col, clicked.row);
            if (path.length > 0) { game.frog.path = path; game.frog.isMoving = true; game.frog.state = 'moving'; }
        }
    });

    window.addEventListener('keydown', (e) => {
        if (e.altKey && (e.code === 'KeyC' || e.key === 'c' || e.key === 'C')) {
            if (game.state.gameState === 'PLAYING') {
                ui.triggerWinLevel();
            }
        }
    });
}