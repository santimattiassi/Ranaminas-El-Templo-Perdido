/**
 * Renderizado en Canvas.
 * @module renderer
 */

import { GRID_CONFIG, BIOMES } from './config.js';
import * as game from './game.js';

export let canvas = null;
export let ctx = null;

export let startX = 0;
export let startY = 0;

let shakeDuration = 0;
let shakeIntensity = 0;

export let particles = [];
export let bossProjectiles = [];

let frogSqueezeScaleX = 1.0;
let frogSqueezeScaleY = 1.0;

const biomeImages = {};
function preloadBiomeImages() {
    BIOMES.forEach(b => {
        const img = new Image();
        img.src = b.imageSrc;
        biomeImages[b.name] = img;
    });
}
preloadBiomeImages();

export function initCanvas(canvasElement) {
    canvas = canvasElement;
    ctx = canvas.getContext('2d');

    startX = Math.floor((canvas.width - (GRID_CONFIG.cols * GRID_CONFIG.cellSize)) / 2);
    startY = Math.floor((canvas.height - (GRID_CONFIG.rows * GRID_CONFIG.cellSize)) / 2) + 12;
}

export function gridToScreen(col, row) {
    return {
        x: startX + col * GRID_CONFIG.cellSize,
        y: startY + row * GRID_CONFIG.cellSize
    };
}

export function screenToGrid(mouseX, mouseY) {
    for (let c = 0; c < GRID_CONFIG.cols; c++) {
        for (let r = 0; r < GRID_CONFIG.rows; r++) {
            const screenPos = gridToScreen(c, r);
            const isSunken = game.grid[c][r].visited || game.grid[c][r].exploded;
            const depth = isSunken ? 0 : GRID_CONFIG.depthHeight;
            const topY = screenPos.y - depth;

            if (mouseX >= screenPos.x && mouseX <= screenPos.x + GRID_CONFIG.cellSize &&
                mouseY >= topY && mouseY <= topY + GRID_CONFIG.cellSize) {
                return { col: c, row: r };
            }
        }
    }
    return null;
}

export function triggerScreenShake(duration, intensity) {
    shakeDuration = duration;
    shakeIntensity = intensity;
}

export function spawnExplosionParticles(x, y) {
    const colors = ['#f87171', '#f59e0b', '#ef4444', '#facc15', '#ffffff'];
    import('./entities.js').then(module => {
        for(let i=0; i<35; i++){
            particles.push(new module.Particle(x, y, colors[Math.floor(Math.random() * colors.length)], 'spark'));
        }
    });
}

export function spawnHeartParticles(x, y) {
    import('./entities.js').then(module => {
        for(let i=0; i<15; i++) particles.push(new module.Particle(x, y, '#ef4444', 'heart'));
    });
}

export function spawnCoinParticles(x, y) {
    import('./entities.js').then(module => {
        for(let i=0; i<12; i++) particles.push(new module.Particle(x, y, '#fbbf24', 'star'));
    });
}

function drawFlagEntity(ctx, x, y) {
    ctx.save();
    ctx.translate(x + GRID_CONFIG.cellSize / 2, y + GRID_CONFIG.cellSize / 2);
    ctx.strokeStyle = '#9ca3af'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-3, 8); ctx.lineTo(-3, -10); ctx.stroke();
    ctx.fillStyle = '#f87171'; ctx.beginPath(); ctx.moveTo(-3, -10); ctx.lineTo(7, -6 + Math.sin(Date.now() * 0.01) * 1.5); ctx.lineTo(-3, -2); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#facc15'; ctx.beginPath(); ctx.arc(-3, -10, 2, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
}
function drawExplodedMine(ctx, x, y) {
    ctx.save();
    ctx.fillStyle = '#27272a'; ctx.beginPath(); ctx.ellipse(x + GRID_CONFIG.cellSize / 2, y + GRID_CONFIG.cellSize / 2, 16, 9, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.ellipse(x + GRID_CONFIG.cellSize / 2, y + GRID_CONFIG.cellSize / 2, 10, 5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fbbf24'; ctx.beginPath(); ctx.ellipse(x + GRID_CONFIG.cellSize / 2, y + GRID_CONFIG.cellSize / 2, 5, 2.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
}
function drawUnexplodedMine(ctx, x, y) {
    ctx.save(); ctx.translate(x + GRID_CONFIG.cellSize / 2, y + GRID_CONFIG.cellSize / 2);
    ctx.strokeStyle = '#3f3f46'; ctx.lineWidth = 3; const spikes = 8;
    for (let i = 0; i < spikes; i++) { const angle = (i * Math.PI * 2) / spikes; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(angle) * 14, Math.sin(angle) * 14); ctx.stroke(); }
    ctx.fillStyle = '#18181b'; ctx.strokeStyle = '#52525b'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(0, 0, 10, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    const redPulse = 0.5 + Math.sin(Date.now() * 0.01) * 0.5; ctx.fillStyle = `rgba(239, 68, 68, ${redPulse})`; ctx.shadowColor = '#ef4444'; ctx.shadowBlur = 4; ctx.beginPath(); ctx.arc(-2.5, -2.5, 2.5, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
}
function drawHeartEntity(ctx, x, y) {
    ctx.save(); const pulse = 1 + Math.sin(Date.now() / 150) * 0.1; ctx.translate(x + GRID_CONFIG.cellSize / 2, y + GRID_CONFIG.cellSize / 2); ctx.scale(pulse, pulse);
    ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.moveTo(0, 3); ctx.bezierCurveTo(-4, -2, -8, -2, -8, 3); ctx.bezierCurveTo(-8, 7, -4, 9, 0, 13); ctx.bezierCurveTo(4, 9, 8, 7, 8, 3); ctx.bezierCurveTo(8, -2, 4, -2, 0, 3); ctx.fill();
    ctx.restore();
}
function drawCoinEntity(ctx, x, y) {
    ctx.save(); const bounce = Math.sin(Date.now() / 100) * 2; const spin = Math.sin(Date.now() / 80); ctx.translate(x + GRID_CONFIG.cellSize / 2, y + GRID_CONFIG.cellSize / 2 + bounce); ctx.scale(spin, 1);
    ctx.fillStyle = '#d97706'; ctx.beginPath(); ctx.arc(0, 0, 6, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#fbbf24'; ctx.beginPath(); ctx.arc(0, 0, 5, 0, Math.PI * 2); ctx.fill(); ctx.restore();
}
function drawStoneEntity(ctx, x, y) {
    ctx.save(); ctx.translate(x + GRID_CONFIG.cellSize / 2, y + GRID_CONFIG.cellSize / 2);
    ctx.fillStyle = '#64748b'; ctx.strokeStyle = '#475569'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(-10, 2); ctx.lineTo(-6, -10); ctx.lineTo(6, -10); ctx.lineTo(10, 2); ctx.lineTo(0, 8); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(-3, -2); ctx.lineTo(3, -2); ctx.moveTo(0, -6); ctx.lineTo(0, 2); ctx.stroke(); ctx.restore();
}
function drawNumberIndicator(ctx, val, x, y) {
    ctx.save(); ctx.font = 'bold 15px Orbitron, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const colors = { 1: '#60a5fa', 2: '#4ade80', 3: '#f87171', 4: '#c084fc', 5: '#fb923c', 6: '#22d3ee', 7: '#f472b6', 8: '#facc15' };
    ctx.fillStyle = colors[val] || '#ffffff'; ctx.shadowColor = colors[val] || '#000000'; ctx.shadowBlur = 3; ctx.fillText(val, x + GRID_CONFIG.cellSize / 2, y + GRID_CONFIG.cellSize / 2); ctx.restore();
}

export function drawFrogHero(ctx, x, y, frog, time) {
    ctx.save();
    ctx.translate(x + GRID_CONFIG.cellSize / 2, y + GRID_CONFIG.cellSize / 2 - 8);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.ellipse(0, 15, 15, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    const animWave = frog.isMoving ? Math.sin(time * 0.015) : Math.sin(time * 0.003) * 0.3;
    const isBlinking = (time % 4000) < 150;
    const tilt = animWave * 0.05;
    ctx.rotate(tilt);

    frogSqueezeScaleX += (1.0 - frogSqueezeScaleX) * 0.15;
    frogSqueezeScaleY += (1.0 - frogSqueezeScaleY) * 0.15;
    ctx.scale(frogSqueezeScaleX, frogSqueezeScaleY);

    ctx.fillStyle = '#10b981'; ctx.beginPath(); ctx.ellipse(-11 + animWave * 2, 10, 7, 4, -0.3, 0, Math.PI * 2); ctx.ellipse(11 - animWave * 2, 10, 7, 4, 0.3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fbbf24'; ctx.beginPath(); ctx.ellipse(-13 + animWave * 2, 11, 3.5, 2, 0, 0, Math.PI * 2); ctx.ellipse(13 - animWave * 2, 11, 3.5, 2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#059669'; ctx.beginPath(); ctx.arc(0, 0, 11, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fef08a'; ctx.beginPath(); ctx.ellipse(0, 2, 7, 8, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#10b981'; ctx.beginPath(); ctx.arc(0, -8, 9, 0, Math.PI * 2); ctx.fill();

    if (isBlinking) {
        ctx.fillStyle = '#059669'; ctx.beginPath(); ctx.rect(-8, -17, 16, 5); ctx.fill();
    } else {
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(-5, -15, 3, 0, Math.PI * 2); ctx.arc(5, -15, 3, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#000000'; ctx.beginPath(); const px = frog.direction === 'left' ? -1 : (frog.direction === 'right' ? 1 : 0); ctx.arc(-5 + px, -15, 1.5, 0, Math.PI * 2); ctx.arc(5 + px, -15, 1.5, 0, Math.PI * 2); ctx.fill();
    }

    ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.rect(-8, -13, 16, 2.5); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-7, -12); ctx.lineTo(-13, -9 + Math.sin(time * 0.01) * 2); ctx.lineTo(-11, -7); ctx.closePath(); ctx.fill();

    const activeShield = game.state.shopInventory.find(i => i.id === 'shield');
    if (activeShield && activeShield.quantity > 0) {
        ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 1.5; ctx.shadowColor = '#0284c7'; ctx.shadowBlur = 6; ctx.beginPath();
        const shieldAngle = time * 0.003; const sx = Math.cos(shieldAngle) * 18; const sy = Math.sin(shieldAngle) * 18;
        ctx.arc(sx, sy, 3, 0, Math.PI * 2); ctx.fillStyle = '#e0f2fe'; ctx.fill(); ctx.stroke();
    }

    ctx.restore();
}

function drawProceduralBackground(ctx, biomeIndex, w, h, time, mx, my) {
    ctx.save();
    const b = BIOMES[biomeIndex];
    const parallaxX = (mx - w / 2);
    const parallaxY = (my - h / 2);

    const p0x = parallaxX * -0.02;
    const p0y = parallaxY * -0.02;
    const grad = ctx.createLinearGradient(0, p0y, 0, h + p0y);
    grad.addColorStop(0, b.depth);
    grad.addColorStop(1, b.floor);
    ctx.fillStyle = grad;
    ctx.fillRect(-20 + p0x, -20 + p0y, w + 40, h + 40);
    ctx.restore();
}

export function drawBossEntity(ctx, x, y, biomeIndex, time) {
    ctx.save();
    ctx.translate(x, y);
    const floatY = Math.sin(time * 0.003) * 6;
    ctx.translate(0, floatY);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(0, 50, 25, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 10;

    if (biomeIndex === 0) {
        ctx.shadowColor = '#10b981';
        ctx.fillStyle = '#064e3b';
        ctx.beginPath(); ctx.moveTo(-20, 20); ctx.lineTo(20, 20); ctx.lineTo(15, -10); ctx.lineTo(-15, -10); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#047857'; ctx.beginPath(); ctx.ellipse(0, -5, 18, 12, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#065f46'; ctx.fillRect(-12, -2, 24, 15);
        ctx.fillStyle = '#fbbf24'; ctx.beginPath(); ctx.arc(-6, -8, 3, 0, Math.PI * 2); ctx.arc(6, -8, 3, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#dc2626'; ctx.beginPath(); ctx.arc(-6, -8, 1, 0, Math.PI * 2); ctx.arc(6, -8, 1, 0, Math.PI * 2); ctx.fill();
    } else {
        ctx.shadowColor = '#ef4444';
        ctx.fillStyle = '#dc2626';
        ctx.beginPath(); ctx.arc(0, 0, 20, 0, Math.PI*2); ctx.fill();
    }

    ctx.restore();
}

export function renderFrame(mouseHoveredCell, mouseX, mouseY) {
    ctx.save();

    if (shakeDuration > 0) {
        const shakeX = (Math.random() - 0.5) * shakeIntensity;
        const shakeY = (Math.random() - 0.5) * shakeIntensity;
        ctx.translate(shakeX, shakeY);
        shakeDuration--;
    }

    const time = Date.now();
    const biome = BIOMES[game.state.currentBiomeIndex];
    drawProceduralBackground(ctx, game.state.currentBiomeIndex, canvas.width, canvas.height, time, mouseX, mouseY);

    ctx.fillStyle = biome.overlayColor || 'rgba(10, 15, 25, 0.40)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

    for (let r = 0; r < GRID_CONFIG.rows; r++) {
        for (let c = 0; c < GRID_CONFIG.cols; c++) {
            const tile = game.grid[c]?.[r];
            if (!tile) continue;

            const screenPos = gridToScreen(c, r);
            const isHovered = (mouseHoveredCell.col === c && mouseHoveredCell.row === r);
            const isVisible = (game.frog.isSpawned && Math.abs(c - game.frog.col) <= 1 && Math.abs(r - game.frog.row) <= 1);

            const isSunken = tile.visited || tile.exploded;
            let targetDepth = isSunken ? 0 : GRID_CONFIG.depthHeight;
            tile.animDepth += (targetDepth - tile.animDepth) * 0.15;
            const depth = tile.animDepth;

            let topColor = '#111827';
            let depthColor = '#030712';
            let borderHighlightColor = null;

            if (isVisible) {
                if (isSunken) { topColor = '#070a13'; depthColor = '#010409'; }
                else { if (isHovered) { topColor = '#10b981'; depthColor = '#047857'; borderHighlightColor = '#34d399'; } else { topColor = '#059669'; depthColor = '#064e3b'; borderHighlightColor = '#10b981'; } }
            } else {
                if (isSunken) { topColor = '#030712'; depthColor = '#000000'; }
                else { if (isHovered) { topColor = '#334155'; depthColor = '#1e293b'; borderHighlightColor = '#475569'; } else { topColor = '#1e293b'; depthColor = '#0f172a'; borderHighlightColor = '#334155'; } }
            }

            ctx.save();
            ctx.globalAlpha = 0.75;

            if (depth > 0) {
                ctx.fillStyle = depthColor; ctx.beginPath(); ctx.rect(screenPos.x, screenPos.y - depth + GRID_CONFIG.cellSize, GRID_CONFIG.cellSize, depth); ctx.fill();
                ctx.fillStyle = 'rgba(0, 0, 0, 0.4)'; ctx.beginPath(); ctx.rect(screenPos.x, screenPos.y - depth + GRID_CONFIG.cellSize + (depth * 0.4), GRID_CONFIG.cellSize, depth * 0.6); ctx.fill();
                ctx.strokeStyle = '#020617'; ctx.lineWidth = 1; ctx.strokeRect(screenPos.x, screenPos.y - depth + GRID_CONFIG.cellSize, GRID_CONFIG.cellSize, depth);
            }

            const tGrad = ctx.createLinearGradient(screenPos.x, screenPos.y - depth, screenPos.x + GRID_CONFIG.cellSize, screenPos.y - depth + GRID_CONFIG.cellSize);
            tGrad.addColorStop(0, topColor); tGrad.addColorStop(1, depthColor);
            ctx.fillStyle = tGrad;

            if (isHovered && !isSunken) { ctx.shadowColor = borderHighlightColor; ctx.shadowBlur = 10; }
            ctx.beginPath(); ctx.rect(screenPos.x, screenPos.y - depth, GRID_CONFIG.cellSize, GRID_CONFIG.cellSize); ctx.fill();

            if (!isSunken) {
                ctx.strokeStyle = borderHighlightColor || 'rgba(255, 255, 255, 0.15)'; ctx.lineWidth = 2;
                ctx.beginPath(); ctx.moveTo(screenPos.x, screenPos.y - depth + GRID_CONFIG.cellSize); ctx.lineTo(screenPos.x, screenPos.y - depth); ctx.lineTo(screenPos.x + GRID_CONFIG.cellSize, screenPos.y - depth); ctx.stroke();
                ctx.strokeStyle = 'rgba(0, 0, 0, 0.65)'; ctx.lineWidth = 2;
                ctx.beginPath(); ctx.moveTo(screenPos.x + GRID_CONFIG.cellSize, screenPos.y - depth); ctx.lineTo(screenPos.x + GRID_CONFIG.cellSize, screenPos.y - depth + GRID_CONFIG.cellSize); ctx.lineTo(screenPos.x, screenPos.y - depth + GRID_CONFIG.cellSize); ctx.stroke();
            } else {
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)'; ctx.lineWidth = 1.5; ctx.strokeRect(screenPos.x, screenPos.y - depth, GRID_CONFIG.cellSize, GRID_CONFIG.cellSize);
                ctx.strokeStyle = 'rgba(0, 0, 0, 0.7)'; ctx.lineWidth = 1.2; ctx.strokeRect(screenPos.x + 1, screenPos.y + 1, GRID_CONFIG.cellSize - 2, GRID_CONFIG.cellSize - 2);
            }
            ctx.restore();

            if (tile.flagged && !isSunken) {
                drawFlagEntity(ctx, screenPos.x, screenPos.y - depth);
            } else {
                if (tile.exploded) drawExplodedMine(ctx, screenPos.x, screenPos.y);
                else if (tile.isMine && isSunken) drawUnexplodedMine(ctx, screenPos.x, screenPos.y - depth);
                else if (tile.isHeart && !tile.heartCollected && isSunken) drawHeartEntity(ctx, screenPos.x, screenPos.y - depth);
                else if (tile.isCoin && !tile.coinCollected && isSunken) drawCoinEntity(ctx, screenPos.x, screenPos.y - depth);
                else if (tile.isStone && isSunken) drawStoneEntity(ctx, screenPos.x, screenPos.y - depth);
                else if (isSunken && isVisible) {
                    if (tile.neighborMines > 0) drawNumberIndicator(ctx, tile.neighborMines, screenPos.x, screenPos.y - depth);
                }
            }

            if (isHovered && game.state.selectedActiveItem && !isSunken) {
                ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 2; ctx.strokeRect(screenPos.x, screenPos.y - depth, GRID_CONFIG.cellSize, GRID_CONFIG.cellSize);
            }
        }
    }

    if (game.frog.isSpawned) {
        if (game.frog.isMoving && game.frog.path.length > 0) {
            const currentTarget = game.frog.path[0];
            const targetPos = gridToScreen(currentTarget.col, currentTarget.row);
            const dx = targetPos.x - game.frog.animX;
            const dy = targetPos.y - game.frog.animY;
            game.frog.direction = dx >= 0 ? 'right' : 'left';

            if (Math.abs(dx) < 2 && Math.abs(dy) < 2) {
                game.frog.animX = targetPos.x; game.frog.animY = targetPos.y; game.frog.col = currentTarget.col; game.frog.row = currentTarget.row; game.frog.path.shift();
                import('./audio.js').then(a => a.sfx.playStep()); game.onFrogSteppedOnCell(game.frog.col, game.frog.row);
                if (game.frog.path.length === 0) { game.frog.isMoving = false; game.frog.state = 'idle'; }
            } else {
                game.frog.animX += dx * game.frog.speed; game.frog.animY += dy * game.frog.speed;
            }
        }
        drawFrogHero(ctx, game.frog.animX, game.frog.animY, game.frog, time);
    }

    if (game.state.bossActive && game.state.gameState === 'PLAYING' && game.state.bossHp > 0) {
        drawBossEntity(ctx, 720, 220, game.state.currentBiomeIndex, time);
        const barW = 300, barH = 12, barX = (canvas.width - barW) / 2, barY = 25;
        ctx.fillStyle = 'rgba(31, 41, 55, 0.8)'; ctx.fillRect(barX, barY, barW, barH);
        const fillW = barW * (game.state.bossHp / game.state.bossMaxHp);
        const hpGrad = ctx.createLinearGradient(barX, barY, barX + fillW, barY);
        hpGrad.addColorStop(0, '#dc2626'); hpGrad.addColorStop(1, '#f87171');
        ctx.fillStyle = hpGrad; ctx.fillRect(barX, barY, fillW, barH);
        ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 1.5; ctx.strokeRect(barX, barY, barW, barH);
        ctx.fillStyle = '#ffffff'; ctx.font = 'bold 11px Inter, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(`${game.state.bossName.toUpperCase()} : ${game.state.bossHp}/${game.state.bossMaxHp}`, canvas.width / 2, barY - 8);
    }

    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update(); particles[i].draw(ctx);
        if (particles[i].life <= 0) particles.splice(i, 1);
    }

    ctx.restore();
}