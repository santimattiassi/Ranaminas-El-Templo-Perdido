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

let frogSqueezeScaleX = 1.0;
let frogSqueezeScaleY = 1.0;

export let damageIntensity = 0;
export function triggerDamageVignette() {
    damageIntensity = 1.0;
}

export let bossDamageFlash = 0;
export function triggerBossFlash() {
    bossDamageFlash = 1.0;
}

let frogHistory = [];
let lastLives = 2;
let lastExtraHearts = 0;
let lastBossHp = 0;

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

    const mouseX = mx !== undefined && mx !== null ? mx : w / 2;
    const mouseY = my !== undefined && my !== null ? my : h / 2;
    const parallaxX = (mouseX - w / 2);
    const parallaxY = (mouseY - h / 2);

    // Capa 0: Fondo Profundo
    const p0x = parallaxX * -0.02;
    const p0y = parallaxY * -0.02;
    
    const bgImg = biomeImages[b.name];
    if (bgImg && bgImg.complete && bgImg.naturalWidth > 0) {
        ctx.drawImage(bgImg, -30 + p0x, -30 + p0y, w + 60, h + 60);
    } else {
        const grad = ctx.createLinearGradient(0, p0y, 0, h + p0y);
        grad.addColorStop(0, b.depth);
        grad.addColorStop(1, b.floor);
        ctx.fillStyle = grad;
        ctx.fillRect(-20 + p0x, -20 + p0y, w + 40, h + 40);
    }

    // Capa 1: Medio Plano
    const p1x = parallaxX * -0.08;
    const p1y = parallaxY * -0.08;

    if (biomeIndex === 0) { // Pantano: Sauces, plantas marinas y niebla crawling
        ctx.save();
        ctx.translate(p1x, p1y);
        ctx.fillStyle = b.floorDepth;
        ctx.globalAlpha = 0.25;
        
        // Dibujar cañas y juncos oscilantes
        for (let i = 0; i < 12; i++) {
            const rx = (i * 75 + 30) % w;
            const rh = 80 + Math.sin(time * 0.001 + i) * 15;
            ctx.lineWidth = 4;
            ctx.strokeStyle = b.floorDepth;
            ctx.beginPath();
            ctx.moveTo(rx, h);
            ctx.quadraticCurveTo(rx + Math.sin(time * 0.001 + i) * 10, h - rh / 2, rx + Math.sin(time * 0.001 + i) * 18, h - rh);
            ctx.stroke();
        }
        
        // Árboles lejanos
        for (let i = 0; i < 4; i++) {
            const tx = (i * 220 + 80) % w;
            const th = 140 + (i * 27) % 60;
            ctx.fillRect(tx, h - th, 30, th);
            ctx.beginPath();
            ctx.arc(tx + 15, h - th, 45, 0, Math.PI * 2);
            ctx.fill();
        }

        // Niebla baja rastrera (3 capas de elipses en movimiento)
        ctx.fillStyle = 'rgba(16, 185, 129, 0.03)';
        for (let i = 0; i < 3; i++) {
            const speed = 0.02 * (i + 1);
            const fx = (time * speed) % (w + 400) - 200;
            const fy = h - 40 + i * 12;
            ctx.beginPath();
            ctx.ellipse(fx, fy, 250, 25, 0, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();

    } else if (biomeIndex === 1) { // Bosque: Capas de pinos mecánicos y Rayos de Sol (God Rays)
        ctx.save();
        ctx.translate(p1x, p1y);
        
        // Rayos de sol (God Rays) filtrándose
        ctx.save();
        ctx.globalAlpha = 0.07 + Math.sin(time * 0.0004) * 0.03;
        const rayGrad = ctx.createLinearGradient(0, 0, w, h);
        rayGrad.addColorStop(0, 'rgba(253, 224, 71, 0.4)');
        rayGrad.addColorStop(1, 'rgba(253, 224, 71, 0)');
        ctx.fillStyle = rayGrad;
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            const angleOffset = Math.sin(time * 0.0002 + i) * 30;
            ctx.moveTo(100 + i * 150 + angleOffset, -50);
            ctx.lineTo(250 + i * 150 + angleOffset, -50);
            ctx.lineTo(w * 0.7 + i * 100, h + 50);
            ctx.lineTo(w * 0.5 + i * 100, h + 50);
            ctx.closePath();
            ctx.fill();
        }
        ctx.restore();

        // Pinos en paralaje
        ctx.fillStyle = b.floorDepth;
        ctx.globalAlpha = 0.28;
        for (let i = 0; i < 8; i++) {
            const sway = Math.sin(time * 0.0008 + i) * 6;
            const tx = (i * 120 + 20) % w;
            const th = 160 + (i * 37) % 80;
            
            ctx.fillRect(tx + sway / 2, h - th, 14, th);
            ctx.beginPath();
            ctx.moveTo(tx - 25 + sway, h - th + 40);
            ctx.lineTo(tx + 7 + sway, h - th - 40);
            ctx.lineTo(tx + 39 + sway, h - th + 40);
            ctx.closePath();
            ctx.fill();
            
            ctx.beginPath();
            ctx.moveTo(tx - 35 + sway, h - th + 90);
            ctx.lineTo(tx + 7 + sway, h - th + 10);
            ctx.lineTo(tx + 49 + sway, h - th + 90);
            ctx.closePath();
            ctx.fill();
        }
        ctx.restore();

    } else if (biomeIndex === 2) { // Desierto: Sol gigante + dunas en capas + calor
        ctx.save();
        ctx.translate(p1x, p1y);
        
        const sunRadius = 90;
        const sunX = w - 150;
        const sunY = 120;
        const sunGrad = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, sunRadius);
        sunGrad.addColorStop(0, 'rgba(251, 146, 60, 0.7)');
        sunGrad.addColorStop(0.3, 'rgba(251, 146, 60, 0.2)');
        sunGrad.addColorStop(1, 'rgba(251, 146, 60, 0)');
        ctx.fillStyle = sunGrad;
        ctx.beginPath();
        ctx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
        ctx.fill();

        for (let d = 0; d < 3; d++) {
            ctx.fillStyle = b.floorDepth;
            ctx.globalAlpha = 0.2 + d * 0.1;
            ctx.beginPath();
            const offset = d * 180 + time * 0.005;
            ctx.moveTo(-50, h + 50);
            ctx.quadraticCurveTo(w * 0.3, h - 80 - d * 20 + Math.sin(offset) * 10, w * 0.7, h - 50 - d * 15);
            ctx.quadraticCurveTo(w * 0.9, h - 40 - d * 10, w + 50, h - 80);
            ctx.lineTo(w + 50, h + 50);
            ctx.closePath();
            ctx.fill();
        }
        ctx.restore();

    } else if (biomeIndex === 3) { // Ciudad: Hologramas, rascacielos iluminados y focos de búsqueda barriendo
        ctx.save();
        ctx.translate(p1x, p1y);

        ctx.save();
        ctx.globalAlpha = 0.12;
        const lightGrad = ctx.createLinearGradient(0, h, 0, 0);
        lightGrad.addColorStop(0, '#6366f1');
        lightGrad.addColorStop(1, 'rgba(99, 102, 241, 0)');
        ctx.fillStyle = lightGrad;
        for (let i = 0; i < 2; i++) {
            ctx.save();
            const angle = Math.sin(time * 0.0006 + i * Math.PI) * 0.4 - 0.2;
            const sx = w * 0.3 + i * (w * 0.4);
            ctx.translate(sx, h);
            ctx.rotate(angle);
            ctx.beginPath();
            ctx.moveTo(-15, 0);
            ctx.lineTo(15, 0);
            ctx.lineTo(100, -h - 100);
            ctx.lineTo(-100, -h - 100);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }
        ctx.restore();

        ctx.fillStyle = b.floorDepth;
        ctx.globalAlpha = 0.25;
        const wFar = (w + 100) / 6;
        for (let i = 0; i < 6; i++) {
            const bHeight = 110 + ((i * 47) % 110);
            const bx = i * wFar - 50;
            ctx.fillRect(bx, h - bHeight, wFar - 8, bHeight);
        }

        ctx.fillStyle = b.depth;
        ctx.globalAlpha = 0.5;
        const wNear = (w + 100) / 8;
        for (let i = 0; i < 8; i++) {
            const bHeight = 60 + ((i * 73) % 90);
            const bx = i * wNear - 50;
            ctx.fillRect(bx, h - bHeight, wNear - 15, bHeight);

            ctx.fillStyle = b.highlight;
            const wRows = Math.floor(bHeight / 12);
            const wCols = Math.floor((wNear - 15) / 10);
            for (let r = 0; r < wRows - 1; r++) {
                for (let c = 0; c < wCols; c++) {
                    const randVal = (i * 23 + r * 13 + c * 37) % 100;
                    if (randVal < 40) {
                        const blink = Math.sin(time * 0.0035 + randVal) * 0.5 + 0.5;
                        ctx.globalAlpha = 0.05 + blink * 0.4;
                        ctx.fillRect(bx + 4 + c * 10, h - bHeight + 6 + r * 12, 4, 6);
                    }
                }
            }
            ctx.fillStyle = b.depth;
            ctx.globalAlpha = 0.5;
        }

        ctx.save();
        ctx.translate(w / 2, 90);
        ctx.rotate(time * 0.001);
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.25)';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#6366f1';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.moveTo(0, -20);
        ctx.lineTo(20, 0);
        ctx.lineTo(0, 20);
        ctx.lineTo(-20, 0);
        ctx.closePath();
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, 0, 10, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        ctx.restore();

    } else if (biomeIndex === 4) { // Nieve: Auroras Boreales animadas y ventiscas
        ctx.save();
        ctx.translate(p1x, p1y);

        ctx.save();
        ctx.globalAlpha = 0.22;
        for (let j = 0; j < 2; j++) {
            const aurGrad = ctx.createLinearGradient(0, 0, w, 0);
            if (j === 0) {
                aurGrad.addColorStop(0, 'rgba(16, 185, 129, 0)');
                aurGrad.addColorStop(0.3, 'rgba(16, 185, 129, 0.7)');
                aurGrad.addColorStop(0.7, 'rgba(6, 182, 212, 0.7)');
                aurGrad.addColorStop(1, 'rgba(99, 102, 241, 0)');
            } else {
                aurGrad.addColorStop(0, 'rgba(99, 102, 241, 0)');
                aurGrad.addColorStop(0.4, 'rgba(139, 92, 246, 0.6)');
                aurGrad.addColorStop(0.8, 'rgba(16, 185, 129, 0.6)');
                aurGrad.addColorStop(1, 'rgba(16, 185, 129, 0)');
            }
            ctx.fillStyle = aurGrad;
            
            ctx.beginPath();
            const yOffset = 40 + j * 50;
            const waveSpeed = time * 0.0005 + j * Math.PI;
            ctx.moveTo(-50, yOffset + Math.sin(waveSpeed) * 30);
            
            ctx.bezierCurveTo(
                w * 0.25, yOffset - 40 + Math.sin(waveSpeed + 1) * 40,
                w * 0.75, yOffset + 80 + Math.cos(waveSpeed - 1) * 50,
                w + 50, yOffset + Math.sin(waveSpeed + 2) * 30
            );
            ctx.lineTo(w + 50, yOffset + 120 + Math.sin(waveSpeed + 2) * 30);
            ctx.bezierCurveTo(
                w * 0.75, yOffset + 200 + Math.cos(waveSpeed - 1) * 50,
                w * 0.25, yOffset + 80 + Math.sin(waveSpeed + 1) * 40,
                -50, yOffset + 120 + Math.sin(waveSpeed) * 30
            );
            ctx.closePath();
            ctx.fill();
        }
        ctx.restore();

        ctx.fillStyle = b.floorDepth;
        ctx.globalAlpha = 0.35;
        ctx.beginPath();
        ctx.moveTo(-50, h + 50);
        for (let x = -50; x <= w + 50; x += 45) {
            const dy = h - 60 - Math.sin(x * 0.003 + 2.0) * 30 - Math.cos(x * 0.002) * 20;
            ctx.lineTo(x, dy);
        }
        ctx.lineTo(w + 50, h + 50);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

    } else { // Montaña: Río de lava fluyendo al fondo y columnas de humo
        ctx.save();
        ctx.translate(p1x, p1y);

        ctx.fillStyle = b.depth;
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.moveTo(-50, h + 50);
        for (let x = -50; x <= w + 50; x += 35) {
            const dy = h - 110 - Math.sin(x * 0.005 + 1.2) * 40 - Math.cos(x * 0.002) * 25;
            ctx.lineTo(x, dy);
        }
        ctx.lineTo(w + 50, h + 50);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = 'rgba(239, 68, 68, 0.4)';
        ctx.beginPath();
        ctx.moveTo(-50, h + 50);
        for (let x = -50; x <= w + 50; x += 20) {
            const dy = h - 35 + Math.sin(time * 0.0025 + x * 0.015) * 8;
            ctx.lineTo(x, dy);
        }
        ctx.lineTo(w + 50, h + 50);
        ctx.closePath();
        ctx.fill();
        
        ctx.fillStyle = 'rgba(249, 115, 22, 0.5)';
        ctx.beginPath();
        ctx.moveTo(-50, h + 50);
        for (let x = -50; x <= w + 50; x += 20) {
            const dy = h - 25 + Math.sin(time * 0.003 - x * 0.02) * 6;
            ctx.lineTo(x, dy);
        }
        ctx.lineTo(w + 50, h + 50);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }

    // Capa 2: Clima y Partículas ambientales
    const p2x = parallaxX * -0.15;
    const p2y = parallaxY * -0.15;
    ctx.save();
    ctx.translate(p2x, p2y);

    if (biomeIndex === 0) { // Pantano: Luciérnagas amarillas parpadeantes
        for (let i = 0; i < 20; i++) {
            const speed = 8 + (i * 3) % 10;
            const size = 2 + (i * 2) % 4;
            const startX = (i * 97) % (w + 40) - 20;
            const y = h - 30 - ((time * 0.0003 * speed + i * 27) % (h - 60));
            const x = startX + Math.sin(time * 0.001 + i) * 20;
            const blink = 0.2 + 0.8 * Math.abs(Math.sin(time * 0.002 + i));

            ctx.save();
            ctx.beginPath();
            ctx.arc(x, y, size * 2.5, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(234, 179, 8, 0.15)';
            ctx.fill();

            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(253, 224, 71, ${blink})`;
            ctx.fill();
            ctx.restore();
        }
    } else if (biomeIndex === 1) { // Bosque: Hojas verdes cayendo y esporas brillantes
        for (let i = 0; i < 12; i++) {
            const speedY = 15 + (i * 4) % 18;
            const size = 6 + (i * 2) % 8;
            const startX = (i * 73) % (w + 40) - 20;
            const y = ((time * 0.0007 * speedY + i * 97) % (h + 40)) - 20;
            const x = (startX + Math.sin(time * 0.0015 + i) * 25) % (w + 40) - 20;
            const angle = time * 0.0012 + i;

            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(angle);
            ctx.beginPath();
            ctx.ellipse(0, 0, size, size / 2.2, 0, 0, Math.PI * 2);
            ctx.fillStyle = b.active;
            ctx.globalAlpha = 0.08 + (i % 3) * 0.06;
            ctx.fill();
            ctx.restore();
        }
        for (let i = 0; i < 10; i++) {
            const sx = (i * 113 + time * 0.02) % w;
            const sy = (i * 59 + Math.sin(time * 0.001 + i) * 20) % (h - 100) + 50;
            ctx.beginPath();
            ctx.arc(sx, sy, 1.5, 0, Math.PI * 2);
            ctx.fillStyle = '#4ade80';
            ctx.globalAlpha = 0.2 + Math.abs(Math.sin(time * 0.003 + i)) * 0.4;
            ctx.fill();
        }
    } else if (biomeIndex === 2) { // Desierto: Viento y polvo de arena rápido
        for (let i = 0; i < 20; i++) {
            const speedX = 28 + (i * 8) % 30;
            const startY = (i * 113) % h;
            const x = (time * 0.0012 * speedX + i * 59) % (w + 100) - 50;
            const y = startY + Math.sin(time * 0.002 + i) * 8;
            
            ctx.strokeStyle = b.highlight;
            ctx.lineWidth = 1.0;
            ctx.globalAlpha = 0.06 + (i % 4) * 0.04;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x - 25, y - 1);
            ctx.stroke();
        }
    } else if (biomeIndex === 3) { // Ciudad: Gotas de lluvia digital (neón cian/magenta)
        for (let i = 0; i < 30; i++) {
            const speedY = 18 + (i * 7) % 22;
            const startX = (i * 83) % w;
            const y = ((time * 0.0008 * speedY + i * 113) % (h + 30)) - 20;
            
            ctx.strokeStyle = i % 2 === 0 ? '#6366f1' : '#ec4899';
            ctx.lineWidth = 1.2;
            ctx.globalAlpha = 0.12 + (i % 4) * 0.08;
            ctx.beginPath();
            ctx.moveTo(startX, y);
            ctx.lineTo(startX - 2, y + 15);
            ctx.stroke();
        }
    } else if (biomeIndex === 4) { // Nieve: Copos de nieve esponjosos oscilantes
        for (let i = 0; i < 35; i++) {
            const speedY = 10 + (i * 5) % 18;
            const speedX = -3 + (i * 2) % 6;
            const size = 1.8 + (i * 2) % 3.5;
            const startX = (i * 117) % (w + 40) - 20;
            const y = ((time * 0.0007 * speedY + i * 47) % (h + 20)) - 10;
            let x = (startX + time * 0.0006 * speedX + Math.sin(time * 0.0008 + i) * 20) % (w + 40) - 20;
            if (x < -20) x += (w + 40);

            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.globalAlpha = 0.2 + (i % 4) * 0.15;
            ctx.fill();
        }
    } else { // Montaña: Ceniza y chispas de lava ascendentes
        for (let i = 0; i < 22; i++) {
            const speedY = 14 + (i * 5) % 16;
            const size = 1.5 + (i * 2) % 3.0;
            const startX = (i * 103) % (w + 40) - 20;
            const y = h - ((time * 0.0005 * speedY + i * 59) % (h + 40)) - 20;
            const x = startX + Math.sin(time * 0.0018 + i) * 15;
            const glow = 0.3 + 0.7 * Math.abs(Math.sin(time * 0.0025 + i));

            ctx.save();
            ctx.beginPath();
            ctx.arc(x, y, size * 2.2, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
            ctx.fill();

            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(249, 115, 22, ${glow})`;
            ctx.fill();
            ctx.restore();
        }
    }

    ctx.restore();
    ctx.restore();
}

export function drawBossEntity(ctx, x, y, biomeIndex, time) {
    ctx.save();
    ctx.translate(x, y);

    let hasFlash = false;
    if (bossDamageFlash > 0) {
        bossDamageFlash -= 0.05;
        if (Math.floor(Date.now() / 60) % 2 === 0) {
            ctx.filter = 'brightness(1.8) sepia(1) hue-rotate(-50deg) saturate(8)';
            hasFlash = true;
        }
    }

    // Movimiento oscilante vertical
    const floatY = Math.sin(time * 0.003) * 6;
    ctx.translate(0, floatY);

    // Plataforma y Aura de Alto Contraste para el Jefe
    const b = BIOMES[biomeIndex];
    ctx.save();
    const glowGrad = ctx.createRadialGradient(0, 0, 10, 0, 0, 75);
    glowGrad.addColorStop(0, b.glowColor || 'rgba(239, 68, 68, 0.6)');
    glowGrad.addColorStop(0.4, b.glowColor ? b.glowColor.replace('0.4', '0.2') : 'rgba(239, 68, 68, 0.2)');
    glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(0, 0, 75, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.fillStyle = 'rgba(10, 10, 15, 0.85)';
    ctx.strokeStyle = b.highlight || '#ef4444';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = b.highlight || '#ef4444';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(0, 0, 50, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Sombra del jefe
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(0, 50, 25, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 10;

    if (biomeIndex === 0) { // Caimán (Swamp)
        ctx.shadowColor = '#10b981';
        ctx.fillStyle = '#064e3b';
        ctx.beginPath();
        ctx.moveTo(-20, 20);
        ctx.lineTo(20, 20);
        ctx.lineTo(15, -10);
        ctx.lineTo(-15, -10);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#047857';
        ctx.beginPath();
        ctx.ellipse(0, -5, 18, 12, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#065f46';
        ctx.fillRect(-12, -2, 24, 15);

        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(-6, -8, 3, 0, Math.PI * 2);
        ctx.arc(6, -8, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.arc(-6, -8, 1, 0, Math.PI * 2);
        ctx.arc(6, -8, 1, 0, Math.PI * 2);
        ctx.fill();

    } else if (biomeIndex === 1) { // Serpiente (Forest)
        ctx.shadowColor = '#22c55e';
        ctx.strokeStyle = '#14532d';
        ctx.lineWidth = 12;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(0, 15, 20, 0, Math.PI * 1.5);
        ctx.stroke();

        ctx.fillStyle = '#15803d';
        ctx.beginPath();
        ctx.ellipse(0, -10, 14, 10, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(-4, -12, 2, 0, Math.PI * 2);
        ctx.arc(4, -12, 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#dc2626';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, 8);
        ctx.moveTo(0, 8);
        ctx.lineTo(-3, 11);
        ctx.moveTo(0, 8);
        ctx.lineTo(3, 11);
        ctx.stroke();

    } else if (biomeIndex === 2) { // Escorpión (Desert)
        ctx.shadowColor = '#ea580c';
        ctx.strokeStyle = '#9a3412';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(0, 10);
        ctx.quadraticCurveTo(20, -10, 5, -25);
        ctx.stroke();

        ctx.fillStyle = '#ea580c';
        ctx.beginPath();
        ctx.arc(5, -25, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#7c2d12';
        ctx.beginPath();
        ctx.ellipse(0, 5, 16, 12, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#7c2d12';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(-10, 5);
        ctx.lineTo(-20, -5);
        ctx.moveTo(10, 5);
        ctx.lineTo(20, -5);
        ctx.stroke();

        ctx.fillStyle = '#9a3412';
        ctx.beginPath();
        ctx.arc(-20, -5, 4, 0, Math.PI * 2);
        ctx.arc(20, -5, 4, 0, Math.PI * 2);
        ctx.fill();

    } else if (biomeIndex === 3) { // Megadrón (City)
        ctx.shadowColor = '#6366f1';
        ctx.fillStyle = '#3730a3';
        ctx.beginPath();
        ctx.arc(0, -5, 16, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#1e1b4b';
        ctx.fillRect(-22, -8, 44, 4);

        ctx.fillStyle = '#dc2626';
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(0, -5, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#818cf8';
        ctx.fillRect(-10, 11, 4, 6);
        ctx.fillRect(6, 11, 4, 6);

        ctx.fillStyle = '#a5b4fc';
        ctx.globalAlpha = 0.6;
        ctx.beginPath();
        ctx.arc(-8, 20 + Math.sin(time * 0.025) * 3, 2, 0, Math.PI * 2);
        ctx.arc(8, 20 + Math.sin(time * 0.025) * 3, 2, 0, Math.PI * 2);
        ctx.fill();

    } else if (biomeIndex === 4) { // Yeti (Snow)
        ctx.shadowColor = '#06b6d4';
        ctx.fillStyle = '#e2e8f0';
        ctx.beginPath();
        ctx.arc(0, -5, 20, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#0891b2';
        ctx.beginPath();
        ctx.moveTo(-16, -15);
        ctx.quadraticCurveTo(-24, -24, -12, -26);
        ctx.lineTo(-12, -20);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(16, -15);
        ctx.quadraticCurveTo(24, -24, 12, -26);
        ctx.lineTo(12, -20);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#cbd5e1';
        ctx.beginPath();
        ctx.ellipse(0, -2, 12, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#eab308';
        ctx.beginPath();
        ctx.arc(-5, -3, 2, 0, Math.PI * 2);
        ctx.arc(5, -3, 2, 0, Math.PI * 2);
        ctx.fill();

    } else { // Dragón de Obsidiana (Mountain)
        ctx.shadowColor = '#ef4444';
        ctx.fillStyle = '#1c1917';
        ctx.beginPath();
        ctx.moveTo(10, 30);
        ctx.lineTo(-15, 10);
        ctx.lineTo(5, -15);
        ctx.lineTo(25, -10);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#292524';
        ctx.beginPath();
        ctx.moveTo(5, -15);
        ctx.lineTo(-18, -25);
        ctx.lineTo(-24, -10);
        ctx.lineTo(5, -5);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.moveTo(5, -15);
        ctx.lineTo(12, -25);
        ctx.lineTo(10, -10);
        ctx.fill();

        ctx.fillStyle = '#f97316';
        ctx.beginPath();
        ctx.arc(-8, -17, 2.5, 0, Math.PI * 2);
        ctx.fill();
    }

    if (hasFlash) {
        ctx.filter = 'none';
    }

    ctx.restore();
}

function drawChestEntity(ctx, x, y) {
    ctx.save();
    ctx.translate(x + GRID_CONFIG.cellSize / 2, y + GRID_CONFIG.cellSize / 2);
    const bounce = Math.sin(Date.now() * 0.005) * 1.5;
    ctx.translate(0, bounce);
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-12, -4, 24, 14);
    ctx.fillStyle = '#b45309';
    ctx.fillRect(-12, -10, 24, 6);
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(-8, -10, 3, 20);
    ctx.fillRect(5, -10, 3, 20);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-2, -4, 4, 4);
    ctx.restore();
}

function drawTrapEntity(ctx, x, y) {
    ctx.save();
    ctx.translate(x + GRID_CONFIG.cellSize / 2, y + GRID_CONFIG.cellSize / 2);
    ctx.fillStyle = '#475569';
    ctx.fillRect(-14, 6, 28, 4);
    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.moveTo(-10, 6); ctx.lineTo(-8, -2); ctx.lineTo(-6, 6);
    ctx.moveTo(-2, 6); ctx.lineTo(0, -4); ctx.lineTo(2, 6);
    ctx.moveTo(6, 6); ctx.lineTo(8, -2); ctx.lineTo(10, 6);
    ctx.fill();
    ctx.restore();
}

function drawFirePuddle(ctx, x, y) {
    ctx.save();
    ctx.translate(x + GRID_CONFIG.cellSize / 2, y + GRID_CONFIG.cellSize / 2);
    const time = Date.now();
    const scale = 0.8 + Math.sin(time * 0.02) * 0.15;
    ctx.scale(scale, scale);
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(0, 12);
    ctx.bezierCurveTo(-12, 3, -12, -12, 0, -16);
    ctx.bezierCurveTo(12, -12, 12, 3, 0, 12);
    ctx.fill();
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.moveTo(0, 8);
    ctx.bezierCurveTo(-8, 0, -8, -8, 0, -12);
    ctx.bezierCurveTo(8, -8, 8, 0, 0, 8);
    ctx.fill();
    ctx.restore();
}

function drawDamageVignette(ctx, w, h) {
    if (damageIntensity <= 0) return;
    damageIntensity -= 0.02;
    ctx.save();
    const grad = ctx.createRadialGradient(w / 2, h / 2, w * 0.3, w / 2, h / 2, w * 0.7);
    grad.addColorStop(0, 'rgba(239, 68, 68, 0)');
    grad.addColorStop(1, `rgba(239, 68, 68, ${damageIntensity * 0.5})`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
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

            // Dibujar advertencia de ataque de Jefe activa
            const bossWarning = game.state.bossWarnings.find(w => w.col === c && w.row === r);
            const cityCrossWarning = game.state.bossWarnings.find(w => w.type === 3 && (w.col === c || w.row === r));
            
            if (bossWarning) {
                const pulse = 0.5 + 0.5 * Math.sin(Date.now() * 0.025);
                ctx.save();
                ctx.fillStyle = `rgba(239, 68, 68, ${0.1 + pulse * 0.45})`;
                ctx.strokeStyle = `rgba(239, 68, 68, ${0.6 + pulse * 0.4})`;
                ctx.lineWidth = 3.5;
                ctx.fillRect(screenPos.x, screenPos.y - depth, GRID_CONFIG.cellSize, GRID_CONFIG.cellSize);
                ctx.strokeRect(screenPos.x, screenPos.y - depth, GRID_CONFIG.cellSize, GRID_CONFIG.cellSize);
                
                // Icono de advertencia parpadeante en el centro
                ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + pulse * 0.7})`;
                ctx.font = "bold 16px Orbitron, sans-serif";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText("⚠️", screenPos.x + GRID_CONFIG.cellSize / 2, screenPos.y - depth + GRID_CONFIG.cellSize / 2);
                ctx.restore();
            } else if (cityCrossWarning) {
                ctx.save();
                ctx.fillStyle = 'rgba(239, 68, 68, 0.12)';
                ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
                ctx.lineWidth = 1.5;
                ctx.fillRect(screenPos.x, screenPos.y - depth, GRID_CONFIG.cellSize, GRID_CONFIG.cellSize);
                ctx.strokeRect(screenPos.x, screenPos.y - depth, GRID_CONFIG.cellSize, GRID_CONFIG.cellSize);
                ctx.restore();
            }

            if (tile.flagged && !isSunken) {
                drawFlagEntity(ctx, screenPos.x, screenPos.y - depth);
            } else {
                if (tile.exploded) drawExplodedMine(ctx, screenPos.x, screenPos.y);
                else if (tile.isMine && isSunken) drawUnexplodedMine(ctx, screenPos.x, screenPos.y - depth);
                else if (tile.isHeart && !tile.heartCollected && isSunken) drawHeartEntity(ctx, screenPos.x, screenPos.y - depth);
                else if (tile.isCoin && !tile.coinCollected && isSunken) drawCoinEntity(ctx, screenPos.x, screenPos.y - depth);
                else if (tile.isStone && isSunken) drawStoneEntity(ctx, screenPos.x, screenPos.y - depth);
                else if (tile.isChest && !tile.chestCollected && isSunken) drawChestEntity(ctx, screenPos.x, screenPos.y - depth);
                else if (tile.isTrap && !tile.trapTriggered && isSunken) drawTrapEntity(ctx, screenPos.x, screenPos.y - depth);
                else if (isSunken && isVisible) {
                    if (tile.neighborMines > 0) drawNumberIndicator(ctx, tile.neighborMines, screenPos.x, screenPos.y - depth);
                }
            }

            // Dibujar charco de lava si corresponde
            if (game.isTileOnFire(c, r)) {
                drawFirePuddle(ctx, screenPos.x, screenPos.y - depth);
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

            // Registrar estela
            frogHistory.push({ x: game.frog.animX, y: game.frog.animY, direction: game.frog.direction });
            if (frogHistory.length > 4) frogHistory.shift();
        } else {
            frogHistory = [];
        }

        // Dibujar estela (fantasmas)
        for (let i = 0; i < frogHistory.length; i++) {
            const ghost = frogHistory[i];
            const opacity = (i + 1) / (frogHistory.length + 1) * 0.2;
            ctx.save();
            ctx.globalAlpha = opacity;
            drawFrogHero(ctx, ghost.x, ghost.y, { ...game.frog, direction: ghost.direction }, time);
            ctx.restore();
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

    for (let i = 0; i < game.state.bossProjectiles.length; i++) {
        game.state.bossProjectiles[i].draw(ctx);
    }

    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update(); particles[i].draw(ctx);
        if (particles[i].life <= 0) particles.splice(i, 1);
    }

    // Decoupled Triggers
    if (game.state.lives < lastLives || game.state.extraHearts < lastExtraHearts) {
        triggerDamageVignette();
    }
    lastLives = game.state.lives;
    lastExtraHearts = game.state.extraHearts;

    if (game.state.bossActive && game.state.bossHp < lastBossHp) {
        triggerBossFlash();
    }
    lastBossHp = game.state.bossHp;

    // Dibujar viñeta de daño roja en pantalla
    drawDamageVignette(ctx, canvas.width, canvas.height);

    ctx.restore();
}