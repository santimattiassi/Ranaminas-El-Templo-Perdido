/**
 * UI y manejo del DOM.
 * @module ui
 */

import * as game from './game.js';
import * as audio from './audio.js';
import { BIOMES } from './config.js';

export const DOM = {
    goldDisplay: null, progressDisplay: null, levelDisplay: null, timerDisplay: null,
    heartsContainer: null, inventoryGrid: null, shopItems: null, gameOverlay: null,
    overlayContent: null, frogStatusText: null, biomeBadge: null, canvasWrapper: null,
    caminitoContainer: null, frogNameDisplay: null, frogNameInput: null, nameModal: null,
    toolExplore: null, toolFlag: null, scoreDisplay: null
};

export function initDOM() {
    DOM.goldDisplay = document.getElementById('gold-display');
    DOM.progressDisplay = document.getElementById('progress-display');
    DOM.levelDisplay = document.getElementById('level-display');
    DOM.timerDisplay = document.getElementById('timer-display');
    DOM.heartsContainer = document.getElementById('hearts-container');
    DOM.inventoryGrid = document.getElementById('inventory-grid');
    DOM.shopItems = document.getElementById('shop-items');
    DOM.gameOverlay = document.getElementById('game-overlay');
    DOM.overlayContent = document.getElementById('overlay-content');
    DOM.frogStatusText = document.getElementById('frog-status-text');
    DOM.biomeBadge = document.getElementById('biome-badge');
    DOM.canvasWrapper = document.getElementById('canvas-wrapper');
    DOM.caminitoContainer = document.getElementById('caminito-container');
    DOM.frogNameDisplay = document.getElementById('frog-name-display');
    DOM.frogNameInput = document.getElementById('frog-name-input');
    DOM.nameModal = document.getElementById('name-modal');
    DOM.toolExplore = document.getElementById('tool-explore');
    DOM.toolFlag = document.getElementById('tool-flag');
    DOM.scoreDisplay = document.getElementById('score-display');

    DOM.toolExplore.addEventListener('click', () => setTool('explore'));
    DOM.toolFlag.addEventListener('click', () => setTool('flag'));

    const musicVol = document.getElementById('music-volume');
    const sfxVol = document.getElementById('sfx-volume');
    if (musicVol) {
        musicVol.addEventListener('input', (e) => {
            const vol = parseInt(e.target.value) / 100;
            document.getElementById('music-volume-text').innerText = e.target.value + '%';
            if (audio.bgm && audio.bgm.setVolume) audio.bgm.setVolume(vol);
        });
    }
    if (sfxVol) {
        sfxVol.addEventListener('input', (e) => {
            const vol = parseInt(e.target.value) / 100;
            document.getElementById('sfx-volume-text').innerText = e.target.value + '%';
            if (audio.sfx && audio.sfx.setVolume) audio.sfx.setVolume(vol);
        });
    }
}

export function updateProgressUI() {
    const p = game.getGameProgress();
    if(DOM.progressDisplay) DOM.progressDisplay.innerText = `${p.revealed} / ${p.total}`;
}

export function updateGoldUI() {
    if(DOM.goldDisplay) DOM.goldDisplay.innerText = game.state.gold;
}

export function updateScoreUI() {
    if(DOM.scoreDisplay) DOM.scoreDisplay.innerText = game.state.totalScore;
}

export function updateHeartsUI() {
    if(!DOM.heartsContainer) return;
    DOM.heartsContainer.innerHTML = '';
    for (let i = 1; i <= 2; i++) {
        if (i <= game.state.lives) {
            DOM.heartsContainer.innerHTML += `<span class="text-red-500 filter drop-shadow-[0_2px_4px_rgba(239,68,68,0.4)] animate-pulse">❤️</span>`;
        } else {
            DOM.heartsContainer.innerHTML += `<span class="text-gray-700 opacity-60">🤍</span>`;
        }
    }
    if (game.state.extraHearts > 0) {
        DOM.heartsContainer.innerHTML += `<span class="text-xs font-bold text-emerald-400 flex items-center gap-1 ml-2 bg-emerald-950 px-2 py-0.5 rounded-lg border border-emerald-500/20">+ (❤️ ${game.state.extraHearts})</span>`;
    }
}

export function updateInventoryUI() {
    if(!DOM.inventoryGrid) return;
    DOM.inventoryGrid.innerHTML = '';
    const ownedItems = game.state.shopInventory.filter(item => item.quantity > 0);
    ownedItems.forEach(item => {
        const isSelected = game.state.selectedActiveItem && game.state.selectedActiveItem.id === item.id;
        DOM.inventoryGrid.innerHTML += `
            <button onclick="window.selectInventoryItem('${item.id}')" class="group relative aspect-square bg-gray-950 hover:bg-gray-800 rounded-xl border ${isSelected ? 'border-sky-400 shadow-lg shadow-sky-500/20' : 'border-gray-800 hover:border-gray-700'} flex flex-col items-center justify-center p-1 transition cursor-pointer">
                <span class="text-2xl">${item.icon}</span>
                <span class="text-[9px] text-gray-400 group-hover:text-white mt-1">x${item.quantity}</span>
                <span class="pointer-events-none absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-950 text-[10px] text-gray-300 px-2.5 py-1 rounded-md border border-gray-800 w-28 text-center opacity-0 group-hover:opacity-100 transition duration-150 shadow-xl z-20">${item.name}</span>
            </button>
        `;
    });
    for (let i = ownedItems.length; i < 3; i++) {
        DOM.inventoryGrid.innerHTML += `<div class="aspect-square bg-gray-950/40 rounded-xl border border-dashed border-gray-800/80 flex items-center justify-center text-xs text-gray-600">Vacío</div>`;
    }
}

export function updateShopUI() {
    if(!DOM.shopItems) return;
    DOM.shopItems.innerHTML = '';
    game.state.shopInventory.forEach(item => {
        const canAfford = game.state.gold >= item.cost;
        DOM.shopItems.innerHTML += `
            <div class="bg-gray-950/80 p-3 rounded-xl border border-gray-800 flex justify-between items-center gap-2 group hover:border-gray-700/80 transition">
                <div class="flex gap-2.5 items-center">
                    <span class="text-2xl bg-gray-900 p-1.5 rounded-lg border border-gray-800 group-hover:scale-105 transition duration-200">${item.icon}</span>
                    <div class="text-left">
                        <h4 class="text-xs font-bold text-gray-200 group-hover:text-emerald-400 transition">${item.name}</h4>
                        <p class="text-[10px] text-gray-400 mt-0.5 max-w-[150px] leading-tight">${item.desc}</p>
                    </div>
                </div>
                <button onclick="window.buyShopItem('${item.id}')" ${!canAfford ? 'disabled' : ''} class="px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 ${canAfford ? 'bg-yellow-500 text-black hover:bg-yellow-400 cursor-pointer' : 'bg-gray-800/50 text-gray-500 cursor-not-allowed'} transition">
                    <i class="ph ph-coins"></i> ${item.cost}
                </button>
            </div>
        `;
    });
}

export function updateLevelMapUI() {
    if(!DOM.biomeBadge) return;
    const biome = BIOMES[game.state.currentBiomeIndex];
    DOM.biomeBadge.innerText = biome.name;
    DOM.biomeBadge.className = `text-xs font-bold px-3 py-1.5 rounded-full border uppercase tracking-widest transition-all ${biome.badgeStyle}`;

    DOM.canvasWrapper.className = `relative bg-gray-950 rounded-2xl border-2 overflow-hidden shadow-2xl flex items-center justify-center flex-grow min-h-[480px] transition-all duration-500 ${biome.wrapperBorder}`;
    DOM.canvasWrapper.style.backgroundColor = biome.unexplored;
    DOM.canvasWrapper.style.backgroundSize = 'cover';
    DOM.canvasWrapper.style.backgroundPosition = 'center';
    DOM.canvasWrapper.style.boxShadow = `0 10px 30px -10px ${biome.glowColor}`;

    DOM.levelDisplay.innerText = `${biome.name} - Lvl ${game.state.currentLevel === 5 ? 'Boss' : game.state.currentLevel}`;

    DOM.caminitoContainer.innerHTML = '';
    for (let i = 1; i <= 5; i++) {
        const isBoss = (i === 5);
        const isCompleted = (i < game.state.currentLevel);
        const isActive = (i === game.state.currentLevel);

        const wrapper = document.createElement('div');
        wrapper.className = 'flex flex-col items-center justify-center relative';

        const timeLabel = document.createElement('div');
        timeLabel.className = 'absolute -top-5 text-[9px] font-mono text-yellow-400 font-bold whitespace-nowrap bg-gray-950/80 px-1 py-0.5 rounded border border-yellow-500/10 pointer-events-none transition-all duration-300';
        if (game.state.completedLevelTimes[i - 1]) {
            const pts = game.state.completedLevelPoints[i - 1] || 0;
            timeLabel.innerText = `${game.state.completedLevelTimes[i - 1]} (+${pts} pts)`;
            timeLabel.style.opacity = '1';
        } else {
            timeLabel.innerText = '';
            timeLabel.style.opacity = '0';
            timeLabel.style.border = 'none';
            timeLabel.style.backgroundColor = 'transparent';
        }
        wrapper.appendChild(timeLabel);

        const node = document.createElement('div');
        if (isBoss) {
            node.className = `w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 border-2 ${isActive ? 'bg-red-600 border-white text-white shadow-lg shadow-red-500/50 scale-110 animate-pulse' : isCompleted ? 'bg-red-950 border-red-500 text-red-400' : 'bg-gray-950 border-gray-800 text-gray-600'}`;
            node.innerHTML = '<i class="ph ph-crown text-sm"></i>';
        } else {
            node.className = `w-14 h-8 rounded-lg flex flex-col items-center justify-center text-[10px] font-bold transition-all duration-300 border ${isActive ? 'bg-emerald-500 border-white text-black shadow-lg shadow-emerald-500/40 scale-105' : isCompleted ? 'bg-emerald-950 border-emerald-500 text-emerald-400' : 'bg-gray-950 border-gray-800 text-gray-500'}`;
            node.innerText = `NIVEL ${i}`;
        }

        wrapper.appendChild(node);
        DOM.caminitoContainer.appendChild(wrapper);

        if (i < 5) {
            const line = document.createElement('div');
            line.className = `h-0.5 w-6 sm:w-10 transition-all duration-300 ${i < game.state.currentLevel ? 'bg-emerald-500' : 'bg-gray-800'}`;
            DOM.caminitoContainer.appendChild(line);
        }
    }
}

export function updateTimerUI() {
    if (game.state.gameState === 'PLAYING' && game.state.levelStartTime > 0) {
        game.state.levelElapsedTime = Math.floor((Date.now() - game.state.levelStartTime) / 1000);
        const mins = Math.floor(game.state.levelElapsedTime / 60).toString().padStart(2, '0');
        const secs = (game.state.levelElapsedTime % 60).toString().padStart(2, '0');
        if (DOM.timerDisplay) DOM.timerDisplay.innerText = `${mins}:${secs}`;
    }
}

export function triggerGameOver() {
    game.state.gameState = 'GAMEOVER';
    audio.sfx.playLose();
    game.frog.state = 'dead';

    DOM.gameOverlay.classList.remove('hidden');
    DOM.overlayContent.innerHTML = `
        <div class="text-red-500 text-6xl mb-2 animate-bounce">💀</div>
        <h2 class="text-red-500 font-extrabold text-3xl pixel-font uppercase">Viaje Terminado</h2>
        <p class="text-sm text-gray-400 my-2">¡${game.frog.name} cayó ante una mina ancestral en el Templo!</p>
        <div class="flex gap-2 text-yellow-500 text-xs bg-gray-900 border border-gray-800 p-3 rounded-xl mt-2 w-full justify-center">
            <i class="ph ph-coins text-lg"></i> Oro Guardado: <span class="font-bold">${game.state.gold}</span>
        </div>
        <button onclick="window.restartGame()" class="mt-4 px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold transition duration-200 uppercase tracking-wider shadow-lg shadow-red-700/30 w-full">
            Volver a Intentar
        </button>
    `;
}

export function triggerWinLevel() {
    game.state.gameState = 'WIN';
    audio.sfx.playWin();

    if (game.state.levelStartTime > 0 && !game.state.completedLevelTimes[game.state.currentLevel - 1]) {
        const mins = Math.floor(game.state.levelElapsedTime / 60).toString().padStart(2, '0');
        const secs = (game.state.levelElapsedTime % 60).toString().padStart(2, '0');
        game.state.completedLevelTimes[game.state.currentLevel - 1] = `${mins}:${secs}`;
    }

    let levelPoints = 0;
    if (!game.state.completedLevelPoints[game.state.currentLevel - 1]) {
        levelPoints = Math.max(50, 1000 - game.state.levelElapsedTime * 3);
        game.state.completedLevelPoints[game.state.currentLevel - 1] = levelPoints;
        game.state.totalScore += levelPoints;
    } else {
        levelPoints = game.state.completedLevelPoints[game.state.currentLevel - 1];
    }

    updateLevelMapUI();
    updateScoreUI();

    const reward = 4 + game.state.currentLevel * 2;
    game.state.gold += reward;
    updateGoldUI();

    DOM.gameOverlay.classList.remove('hidden');

    const isBossWin = (game.state.currentLevel === 5);
    const isGameComplete = (game.state.currentLevel === 5 && game.state.currentBiomeIndex === BIOMES.length - 1);

    if (isGameComplete) {
        DOM.overlayContent.innerHTML = `
            <div class="text-yellow-400 text-6xl mb-2 animate-bounce">🏆 👑 🏆</div>
            <h2 class="text-yellow-400 font-black text-3xl pixel-font uppercase bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500">¡TEMPLO CONQUISTADO!</h2>
            <p class="text-sm text-emerald-300 my-2 font-bold">¡Felicitaciones, ${game.frog.name}! Has superado todos los desafíos y liberado el Templo Perdido.</p>
            <div class="flex flex-col gap-1.5 w-full text-xs text-gray-400 bg-gray-900 border border-gray-800 p-4 rounded-xl my-2 text-left shadow-lg">
                <div class="flex justify-between"><span>Oro de Conquista:</span> <span class="text-yellow-400 font-bold">+${reward}</span></div>
                <div class="flex justify-between border-b border-gray-800 pb-1.5"><span>Oro Total Final:</span> <span class="text-yellow-400 font-bold">${game.state.gold}</span></div>
                <div class="flex justify-between pt-1.5"><span>Puntos del Nivel:</span> <span class="text-amber-400 font-bold">+${levelPoints} pts</span></div>
                <div class="flex justify-between font-bold text-sm border-t border-gray-800 pt-1.5 mt-1 text-amber-300"><span>PUNTUACIÓN TOTAL:</span> <span>${game.state.totalScore} pts</span></div>
            </div>
            <p class="text-xs text-gray-400 my-1 font-semibold">¿Quieres volver a empezar y superar tu récord?</p>
            <button onclick="window.restartGame()" class="mt-3 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black rounded-xl font-black transition duration-200 uppercase tracking-widest shadow-lg shadow-amber-500/30 hover:scale-[1.02] w-full">
                Volver a Empezar la Aventura
            </button>
        `;
    } else {
        DOM.overlayContent.innerHTML = `
            <div class="text-yellow-400 text-5xl mb-2 animate-pulse">⭐ 👑 ⭐</div>
            <h2 class="text-yellow-400 font-extrabold text-2xl pixel-font uppercase">${isBossWin ? '¡BIOMA DESPEJADO!' : '¡TEMPLO DESPEJADO!'}</h2>
            <p class="text-xs text-gray-400 my-2">${isBossWin ? '¡Derrotaste al Jefe Supremo de esta región!' : '¡Desvelaste cada secreto sin dejar una sola mina!'}</p>
            <div class="flex flex-col gap-1 w-full text-xs text-gray-400 bg-gray-900 border border-gray-800 p-3 rounded-xl my-2 text-left">
                <div class="flex justify-between"><span>Oro de Conquista:</span> <span class="text-yellow-400 font-bold">+${reward}</span></div>
                <div class="flex justify-between border-b border-gray-800 pb-1"><span>Oro Total:</span> <span class="text-yellow-400 font-bold">${game.state.gold}</span></div>
                <div class="flex justify-between pt-1"><span>Puntos de Nivel:</span> <span class="text-amber-400 font-bold">+${levelPoints} pts</span></div>
                <div class="flex justify-between border-t border-gray-800 pt-1 mt-1 font-bold text-amber-300"><span>Puntos Totales:</span> <span>${game.state.totalScore} pts</span></div>
            </div>
            <button onclick="window.advanceNextLevel()" class="mt-4 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl font-bold transition duration-200 uppercase tracking-wider shadow-lg shadow-emerald-500/30 w-full">
                ${isBossWin ? 'Viajar al Siguiente Bioma' : `Avanzar al Nivel ${game.state.currentLevel + 1}`}
            </button>
        `;
    }
}

export function setTool(tool) {
    game.state.activeTool = tool;
    if (tool === 'explore') {
        DOM.toolExplore.className = "py-2 px-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-2 transition duration-150 bg-emerald-500 border-emerald-400 text-black shadow-lg shadow-emerald-500/10";
        DOM.toolFlag.className = "py-2 px-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-2 transition duration-150 bg-gray-900 border-gray-800 text-gray-400 hover:bg-gray-850";
    } else {
        DOM.toolFlag.className = "py-2 px-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-2 transition duration-150 bg-red-500 border-red-400 text-black shadow-lg shadow-red-500/10";
        DOM.toolExplore.className = "py-2 px-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-2 transition duration-150 bg-gray-900 border-gray-800 text-gray-400 hover:bg-gray-850";
    }
}

export function setStatusText(text) {
    if(DOM.frogStatusText) DOM.frogStatusText.innerText = text;
}

export function hideOverlay() {
    if(DOM.gameOverlay) DOM.gameOverlay.classList.add('hidden');
}

export function confirmFrogName() {
    let chosenName = DOM.frogNameInput.value.trim();
    if (chosenName === '') {
        DOM.frogNameInput.classList.add('border-red-500');
        setTimeout(() => DOM.frogNameInput.classList.remove('border-red-500'), 1000);
        return; // No dejar continuar sin nombre
    }
    game.frog.name = chosenName;
    DOM.frogNameDisplay.innerText = chosenName;
    DOM.nameModal.classList.add('hidden');
    audio.bgm.start();
    audio.sfx.playHeart();
}

// Global hook
window.confirmFrogName = confirmFrogName;