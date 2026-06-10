/**
 * ============================================================================
 *                    SINTETIZADOR DE SONIDO RETRO 8-BITS
 * ============================================================================
 */

/**
 * @class AudioSynth
 * @description Sintetizador de audio retro de 8 bits basado en Web Audio API.
 * Genera efectos de sonido y atmósferas procedurales en tiempo real sin recursos locales.
 */
class AudioSynth {
    constructor() {
        /**
         * Contexto de audio de la Web Audio API.
         * @type {AudioContext|null}
         */
        this.ctx = null;

        /**
         * Estado de silencio del sintetizador.
         * @type {boolean}
         */
        this.muted = false;

        /**
         * Nivel de volumen de los efectos de sonido (0.0 a 1.0).
         * @type {number}
         */
        this.volume = 0.8;
    }
    
    /**
     * Inicializa el contexto de audio si aún no ha sido creado.
     * Es necesario llamarlo en respuesta a un evento de usuario para cumplir con las políticas del navegador.
     */
    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    /**
     * Método auxiliar privado para reproducir un tono con modulación de frecuencia y ganancia.
     * Permite reducir la duplicidad de código al crear osciladores sencillos.
     * 
     * @param {string} type - Tipo de onda del oscilador ('sine', 'square', 'sawtooth', 'triangle').
     * @param {number} startFreq - Frecuencia inicial en Hz.
     * @param {number} endFreq - Frecuencia final en Hz (si es igual a startFreq, no hay modulación).
     * @param {number} duration - Duración del tono en segundos.
     * @param {number} gainStart - Volumen inicial (ganancia).
     * @param {number} gainEnd - Volumen final (ganancia).
     * @param {number} [delay=0] - Tiempo de retraso antes de comenzar en segundos.
     * @param {string} [rampType='exponential'] - Tipo de transición de frecuencia ('exponential' o 'linear').
     * @private
     */
    _playTone(type, startFreq, endFreq, duration, gainStart, gainEnd, delay = 0, rampType = 'exponential') {
        if (this.muted) return;
        this.init();
        const now = this.ctx.currentTime + delay;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.type = type;
        osc.frequency.setValueAtTime(startFreq, now);
        
        if (endFreq !== startFreq) {
            if (rampType === 'exponential' && startFreq > 0 && endFreq > 0) {
                osc.frequency.exponentialRampToValueAtTime(endFreq, now + duration);
            } else {
                osc.frequency.linearRampToValueAtTime(endFreq, now + duration);
            }
        }
        
        gain.gain.setValueAtTime(gainStart * this.volume, now);
        gain.gain.exponentialRampToValueAtTime((gainEnd || 0.001) * this.volume, now + duration);
        
        osc.start(now);
        osc.stop(now + duration);
    }

    /**
     * Método auxiliar privado para reproducir un efecto de ruido (explosión o ambiente) usando filtros.
     * 
     * @param {number} duration - Duración total del efecto de ruido en segundos.
     * @param {string} filterType - Tipo de filtro de audio (ej. 'lowpass', 'bandpass').
     * @param {number} startFreq - Frecuencia inicial del filtro en Hz.
     * @param {number} endFreq - Frecuencia final del filtro en Hz.
     * @param {number|null} Q - Factor de calidad del filtro (ancho de banda). Pasar null para omitir.
     * @param {number} startGain - Volumen inicial (ganancia).
     * @param {number} gainEnd - Volumen final (ganancia).
     * @param {number} [delay=0] - Retraso en segundos antes de comenzar.
     * @param {string} [rampType='exponential'] - Tipo de transición de la frecuencia del filtro.
     * @private
     */
    _playNoise(duration, filterType, startFreq, endFreq, Q, startGain, gainEnd, delay = 0, rampType = 'exponential') {
        if (this.muted) return;
        this.init();
        const now = this.ctx.currentTime + delay;
        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        
        // Llenar buffer con ruido blanco
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = filterType;
        if (Q !== null) {
            filter.Q.setValueAtTime(Q, now);
        }
        
        filter.frequency.setValueAtTime(startFreq, now);
        if (endFreq !== startFreq) {
            if (rampType === 'exponential' && startFreq > 0 && endFreq > 0) {
                filter.frequency.exponentialRampToValueAtTime(endFreq, now + duration);
            } else {
                filter.frequency.linearRampToValueAtTime(endFreq, now + duration);
            }
        }

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(startGain * this.volume, now);
        gain.gain.exponentialRampToValueAtTime((gainEnd || 0.001) * this.volume, now + duration);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        
        noise.start(now);
        noise.stop(now + duration);
    }

    /**
     * Reproduce el sonido de un paso corto y elástico.
     */
    playStep() {
        this._playTone('triangle', 140, 320, 0.12, 0.08, 0.001);
    }

    /**
     * Reproduce un sonido de explosión de baja frecuencia y con ruido disipado.
     */
    playExplosion() {
        this._playNoise(0.4, 'lowpass', 800, 10, null, 0.3, 0.01);
    }

    /**
     * Reproduce un arpegio ascendente y armonioso para cuando se recoge un corazón.
     */
    playHeart() {
        if (this.muted) return;
        const notes = [261.63, 329.63, 392.00, 523.25]; // Notas C4, E4, G4, C5
        notes.forEach((freq, idx) => {
            this._playTone('sine', freq, freq, 0.15, 0.1, 0.001, idx * 0.08);
        });
    }

    /**
     * Reproduce el clásico tono de obtención de moneda con arpegio rápido de dos notas.
     */
    playCoin() {
        if (this.muted) return;
        this.init();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();
        
        osc.connect(gainNode);
        gainNode.connect(this.ctx.destination);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.setValueAtTime(880.00, now + 0.08); // A5
        
        gainNode.gain.setValueAtTime(0.1 * this.volume, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001 * this.volume, now + 0.2);
        
        osc.start(now);
        osc.stop(now + 0.25);
    }

    /**
     * Reproduce una fanfarria triunfal de notas cuadradas de 8 bits al superar un nivel.
     */
    playWin() {
        if (this.muted) return;
        const melody = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        melody.forEach((freq, idx) => {
            this._playTone('square', freq, freq, 0.2, 0.08, 0.001, idx * 0.1);
        });
    }

    /**
     * Reproduce un sonido descendente y melancólico con ondas de sierra al perder la partida.
     */
    playLose() {
        if (this.muted) return;
        const melody = [392.00, 349.23, 311.13, 246.94];
        melody.forEach((freq, idx) => {
            this._playTone('sawtooth', freq, freq, 0.3, 0.08, 0.001, idx * 0.15);
        });
    }

    /**
     * Reproduce un silbido electrónico descendente de radar para el escáner de pulso.
     */
    playScan() {
        this._playTone('sine', 800, 100, 0.35, 0.15, 0.001, 0, 'linear');
    }

    /**
     * Reproduce efectos de audio ambiental y ruidos atmosféricos contextuales al bioma actual.
     * Se llama periódicamente en el bucle principal.
     * 
     * @param {number} biomeIndex - Índice del bioma actual (0 a 5).
     */
    playBiomeAmbient(biomeIndex) {
        if (this.muted) return;
        const now = this.ctx.currentTime;
        
        if (biomeIndex === 0) { // Pantano: Croac de rana grave de baja frecuencia
            this._playTone('sawtooth', 80, 50, 0.18, 0.04, 0.001);
        } else if (biomeIndex === 1) { // Bosque: Crujido de hojas o trino agudo
            this.init();
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.type = 'sine';
            osc.frequency.setValueAtTime(1200, now);
            osc.frequency.linearRampToValueAtTime(1500, now + 0.08);
            osc.frequency.linearRampToValueAtTime(1300, now + 0.15);
            gain.gain.setValueAtTime(0.02 * this.volume, now);
            gain.gain.exponentialRampToValueAtTime(0.001 * this.volume, now + 0.16);
            osc.start(now);
            osc.stop(now + 0.16);
        } else if (biomeIndex === 2) { // Desierto: Silbido de viento arenoso usando filtro pasa banda
            this.init();
            const bufferSize = this.ctx.sampleRate * 1.5;
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }
            const noise = this.ctx.createBufferSource();
            noise.buffer = buffer;
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.Q.value = 5;
            filter.frequency.setValueAtTime(300, now);
            filter.frequency.linearRampToValueAtTime(450, now + 0.7);
            filter.frequency.linearRampToValueAtTime(250, now + 1.5);
            
            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0.02 * this.volume, now);
            gain.gain.linearRampToValueAtTime(0.04 * this.volume, now + 0.5);
            gain.gain.exponentialRampToValueAtTime(0.001 * this.volume, now + 1.5);
            
            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.ctx.destination);
            noise.start(now);
            noise.stop(now + 1.5);
        } else if (biomeIndex === 3) { // Ciudad: Pitidos melódicos breves simulando tecnología futurista
            const notes = [440, 554.37, 659.25];
            notes.forEach((freq, idx) => {
                this._playTone('sine', freq, freq, 0.25, 0.015, 0.001, idx * 0.12);
            });
        } else if (biomeIndex === 4) { // Nieve: Silbido de viento frío con oscilaciones sinusoidales
            this.init();
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.type = 'sine';
            osc.frequency.setValueAtTime(700, now);
            osc.frequency.linearRampToValueAtTime(750, now + 0.4);
            osc.frequency.linearRampToValueAtTime(680, now + 1.0);
            gain.gain.setValueAtTime(0.015 * this.volume, now);
            gain.gain.exponentialRampToValueAtTime(0.001 * this.volume, now + 1.2);
            osc.start(now);
            osc.stop(now + 1.25);
        } else { // Montaña: Trueno lejano y grave usando filtro pasa bajos
            this._playNoise(2.0, 'lowpass', 100, 20, null, 0.08, 0.001);
        }
    }

    /**
     * Reproduce un sonido metálico de impacto grave cuando el jefe recibe daño.
     */
    playBossDamage() {
        this._playTone('sawtooth', 120, 30, 0.25, 0.15, 0.001);
    }

    /**
     * Reproduce un rugido sísmico basado en ruido blanco filtrado cuando el jefe ataca.
     */
    playBossRoar() {
        this._playNoise(0.8, 'lowpass', 300, 40, null, 0.25, 0.001);
    }

    /**
     * Reproduce un sonido de ascenso rápido (silbido) al lanzar una piedra contra el jefe.
     */
    playStoneThrow() {
        this._playTone('triangle', 300, 800, 0.22, 0.08, 0.001);
    }

    /**
     * Reproduce un sonido cómico de compresión (squish) al hacer clic en la rana.
     */
    playFrogSqueeze() {
        if (this.muted) return;
        this.init();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.quadraticCurveToValueAtTime(150, now + 0.08, now + 0.15);
        gain.gain.setValueAtTime(0.12 * this.volume, now);
        gain.gain.exponentialRampToValueAtTime(0.001 * this.volume, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.16);
    }

    /**
     * Ajusta el volumen general de los efectos de sonido.
     * @param {number} vol - Nivel de volumen entre 0.0 y 1.0.
     */
    setVolume(vol) {
        this.volume = vol;
    }

    /**
     * Silencia o activa los efectos de sonido.
     * @param {boolean} muted - Si es true, silencia el audio.
     */
    setMuted(muted) {
        this.muted = muted;
    }
}

// Instancia única del sintetizador de audio
const sfx = new AudioSynth();
window.sfx = sfx;

// Instancia del secuenciador de música de fondo
const bgm = new MusicSequencer(sfx);
window.bgm = bgm;

// Objeto global que almacena referencias cacheadas de elementos del DOM para optimizar rendimiento.
// Se inicializa en la función startEverything.
const DOM = {
    canvas: null,
    ctx: null,
    goldDisplay: null,
    progressDisplay: null,
    levelDisplay: null,
    timerDisplay: null,
    heartsContainer: null,
    inventoryGrid: null,
    shopItems: null,
    gameOverlay: null,
    overlayContent: null,
    frogStatusText: null,
    biomeBadge: null,
    canvasWrapper: null,
    musicMuteBtn: null,
    musicMuteIcon: null,
    musicVolume: null,
    musicVolumeText: null,
    sfxMuteBtn: null,
    sfxMuteIcon: null,
    sfxVolume: null,
    sfxVolumeText: null,
    caminitoContainer: null,
    frogNameDisplay: null,
    frogNameInput: null,
    nameModal: null,
    toolExplore: null,
    toolFlag: null
};

// Variables globales del Canvas heredadas de la inicialización original
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

/**
 * ============================================================================
 *                    CONFIGURACIÓN DE LOS 6 BIOMAS
 * ============================================================================
 */
const BIOMES = [
    {
        name: 'Pantano',
        unexplored: '#142c1d', depth: '#0a1a0e', active: '#10b981', activeDepth: '#064e3b', floor: '#0c120d', floorDepth: '#030504', highlight: '#34d399',
        badgeStyle: 'bg-emerald-950/80 text-emerald-400 border-emerald-500/20', glowColor: 'rgba(16,185,129,0.4)', wrapperBorder: 'border-emerald-500/50',
        imageSrc: 'img/pantano.png', overlayColor: 'rgba(5, 20, 10, 0.40)'
    },
    {
        name: 'Bosque',
        unexplored: '#273526', depth: '#141c13', active: '#22c55e', activeDepth: '#14532d', floor: '#0f140e', floorDepth: '#040604', highlight: '#4ade80',
        badgeStyle: 'bg-green-950/80 text-green-400 border-green-500/20', glowColor: 'rgba(34,197,94,0.4)', wrapperBorder: 'border-green-500/50',
        imageSrc: 'img/bosque.png', overlayColor: 'rgba(8, 20, 10, 0.42)'
    },
    {
        name: 'Desierto',
        unexplored: '#4d3319', depth: '#2b1c0e', active: '#ea580c', activeDepth: '#7c2d12', floor: '#1c1510', floorDepth: '#090604', highlight: '#f97316',
        badgeStyle: 'bg-amber-950/80 text-amber-400 border-amber-500/20', glowColor: 'rgba(245,158,11,0.4)', wrapperBorder: 'border-amber-500/50',
        imageSrc: 'img/desierto.png', overlayColor: 'rgba(25, 12, 4, 0.42)'
    },
    {
        name: 'Ciudad',
        unexplored: '#2e2a52', depth: '#1a1836', active: '#6366f1', activeDepth: '#3730a3', floor: '#0a0914', floorDepth: '#030308', highlight: '#818cf8',
        badgeStyle: 'bg-indigo-950/80 text-indigo-400 border-indigo-500/20', glowColor: 'rgba(99,102,241,0.4)', wrapperBorder: 'border-indigo-500/50',
        imageSrc: 'img/ciudad.png', overlayColor: 'rgba(10, 8, 25, 0.45)'
    },
    {
        name: 'Nieve',
        unexplored: '#1e305e', depth: '#0f1b3b', active: '#06b6d4', activeDepth: '#0891b2', floor: '#f1f5f9', floorDepth: '#cbd5e1', highlight: '#22d3ee',
        badgeStyle: 'bg-sky-950/80 text-sky-400 border-sky-500/20', glowColor: 'rgba(56,189,248,0.4)', wrapperBorder: 'border-sky-500/50',
        imageSrc: 'img/nieve.png', overlayColor: 'rgba(8, 16, 32, 0.42)'
    },
    {
        name: 'Montaña',
        unexplored: '#333333', depth: '#1c1c1c', active: '#ef4444', activeDepth: '#991b1b', floor: '#171717', floorDepth: '#0a0a0a', highlight: '#f87171',
        badgeStyle: 'bg-red-950/80 text-rose-400 border-rose-500/20', glowColor: 'rgba(239,68,68,0.4)', wrapperBorder: 'border-rose-500/50',
        imageSrc: 'img/montana.png', overlayColor: 'rgba(16, 10, 10, 0.42)'
    }
];

/**
 * Dibuja un fondo animado procedural con 3 capas de profundidad basadas en efecto Parallax.
 * 
 * @param {CanvasRenderingContext2D} cContext - Contexto del Canvas donde dibujar.
 * @param {number} biomeIndex - Índice del bioma (0 a 5).
 * @param {number} w - Ancho del lienzo en píxeles.
 * @param {number} h - Alto del lienzo en píxeles.
 * @param {number} time - Marca de tiempo actual para animaciones continuas.
 */
function drawProceduralBackground(cContext, biomeIndex, w, h, time) {
    cContext.save();
    const b = BIOMES[biomeIndex];
    
    // Parallax basado en posición del ratón
    const mx = lastMouseX ?? w / 2;
    const my = lastMouseY ?? h / 2;
    const parallaxX = (mx - w / 2);
    const parallaxY = (my - h / 2);
    
    // Capa 0: Fondo Profundo (gradiente estático)
    const p0x = parallaxX * -0.02;
    const p0y = parallaxY * -0.02;
    const grad = cContext.createLinearGradient(0, p0y, 0, h + p0y);
    grad.addColorStop(0, b.depth);
    grad.addColorStop(1, b.floor);
    cContext.fillStyle = grad;
    cContext.fillRect(-20 + p0x, -20 + p0y, w + 40, h + 40);
    
    // Capa 1: Medio Plano (Siluetas del terreno del bioma)
    const p1x = parallaxX * -0.08;
    const p1y = parallaxY * -0.08;
    
    if (biomeIndex === 0) { // Pantano (Raíces de sauce)
        cContext.save();
        cContext.translate(p1x, p1y);
        cContext.fillStyle = b.floorDepth;
        cContext.globalAlpha = 0.25;
        for (let i = 0; i < 5; i++) {
            const tx = (i * 180 + 50) % w;
            const th = 120 + (i * 37) % 80;
            cContext.fillRect(tx, h - th, 25, th);
            cContext.beginPath();
            cContext.arc(tx + 12.5, h - th, 30, 0, Math.PI * 2);
            cContext.fill();
        }
        cContext.restore();
        
    } else if (biomeIndex === 1) { // Bosque (Pinos / Árboles)
        cContext.save();
        cContext.translate(p1x, p1y);
        cContext.fillStyle = b.floorDepth;
        cContext.globalAlpha = 0.3;
        for (let i = 0; i < 6; i++) {
            const tx = (i * 150 + 40) % w;
            const th = 150 + (i * 47) % 100;
            cContext.fillRect(tx, h - th, 16, th);
            cContext.beginPath();
            cContext.moveTo(tx - 20, h - th);
            cContext.lineTo(tx + 8, h - th - 50);
            cContext.lineTo(tx + 36, h - th);
            cContext.closePath();
            cContext.fill();
        }
        cContext.restore();
        
    } else if (biomeIndex === 2) { // Desierto (Dunas de arena)
        cContext.save();
        cContext.translate(p1x, p1y);
        cContext.fillStyle = b.floorDepth;
        cContext.globalAlpha = 0.35;
        cContext.beginPath();
        cContext.moveTo(-50, h + 50);
        for (let x = -50; x <= w + 50; x += 30) {
            const dy = h - 60 - Math.sin(x * 0.005 + 1.5) * 35;
            cContext.lineTo(x, dy);
        }
        cContext.lineTo(w + 50, h + 50);
        cContext.closePath();
        cContext.fill();
        cContext.restore();
        
    } else if (biomeIndex === 3) { // Ciudad (Edificios con ventanas parpadeantes)
        cContext.save();
        cContext.translate(p1x, p1y);
        
        // Rascacielos lejanos
        cContext.fillStyle = b.floorDepth;
        cContext.globalAlpha = 0.35;
        const numFar = 6;
        const wFar = (w + 100) / numFar;
        for (let i = 0; i < numFar; i++) {
            const bHeight = 80 + ((i * 47) % 90);
            const bx = i * wFar - 50;
            cContext.fillRect(bx, h - bHeight, wFar - 10, bHeight);
        }
        
        // Rascacielos cercanos
        cContext.fillStyle = b.depth;
        cContext.globalAlpha = 0.5;
        const numNear = 8;
        const wNear = (w + 100) / numNear;
        for (let i = 0; i < numNear; i++) {
            const bHeight = 40 + ((i * 73) % 80);
            const bx = i * wNear - 50;
            const buildH = bHeight;
            cContext.fillRect(bx, h - buildH, wNear - 15, buildH);
            
            // Ventanas iluminadas al azar
            cContext.fillStyle = b.highlight;
            const wRows = Math.floor(buildH / 12);
            const wCols = Math.floor((wNear - 15) / 10);
            for (let r = 0; r < wRows - 1; r++) {
                for (let c = 0; c < wCols; c++) {
                    const randVal = (i * 17 + r * 31 + c * 59) % 100;
                    if (randVal < 35) {
                        const blink = Math.sin(time * 0.0025 + randVal) * 0.5 + 0.5;
                        cContext.globalAlpha = 0.05 + blink * 0.3;
                        cContext.fillRect(bx + 4 + c * 10, h - buildH + 6 + r * 12, 4, 6);
                    }
                }
            }
            cContext.fillStyle = b.depth;
            cContext.globalAlpha = 0.5;
        }
        cContext.restore();
        
    } else if (biomeIndex === 4) { // Nieve (Glaciares e icebergs)
        cContext.save();
        cContext.translate(p1x, p1y);
        cContext.fillStyle = b.floorDepth;
        cContext.globalAlpha = 0.3;
        cContext.beginPath();
        cContext.moveTo(-50, h + 50);
        for (let x = -50; x <= w + 50; x += 40) {
            const dy = h - 70 - Math.sin(x * 0.003 + 2.0) * 45 - Math.cos(x * 0.001) * 15;
            cContext.lineTo(x, dy);
        }
        cContext.lineTo(w + 50, h + 50);
        cContext.closePath();
        cContext.fill();
        cContext.restore();
        
    } else { // Montaña (Cordilleras rocosas superpuestas)
        cContext.save();
        cContext.translate(p1x, p1y);
        cContext.fillStyle = b.depth;
        cContext.globalAlpha = 0.25;
        cContext.beginPath();
        cContext.moveTo(-50, h + 50);
        for (let x = -50; x <= w + 50; x += 15) {
            const dy = h - 110 - Math.sin(x * 0.004 + 1.2) * 50 - Math.cos(x * 0.002) * 30;
            cContext.lineTo(x, dy);
        }
        cContext.lineTo(w + 50, h + 50);
        cContext.closePath();
        cContext.fill();

        cContext.fillStyle = b.floor;
        cContext.globalAlpha = 0.4;
        cContext.beginPath();
        cContext.moveTo(-50, h + 50);
        for (let x = -50; x <= w + 50; x += 15) {
            const dy = h - 70 - Math.sin(x * 0.007) * 35 - Math.cos(x * 0.003 + 2.5) * 20;
            cContext.lineTo(x, dy);
        }
        cContext.lineTo(w + 50, h + 50);
        cContext.closePath();
        cContext.fill();
        cContext.restore();
    }
    
    // Capa 2: Primer Plano (Clima, partículas y partículas flotantes ambientales)
    const p2x = parallaxX * -0.15;
    const p2y = parallaxY * -0.15;
    cContext.save();
    cContext.translate(p2x, p2y);
    
    if (biomeIndex === 0) { // Pantano: Burbujas flotantes
        for (let i = 0; i < 20; i++) {
            const speed = 12 + (i * 7) % 20;
            const size = 5 + (i * 3) % 10;
            const startX = (i * 89) % (w + 40) - 20;
            const y = h + 20 - ((time * 0.0008 * speed + i * 37) % (h + 40));
            const x = startX + Math.sin(time * 0.0012 + i) * 12;
            
            cContext.beginPath();
            cContext.arc(x, y, size, 0, Math.PI * 2);
            cContext.fillStyle = b.active;
            cContext.globalAlpha = 0.06 + (i % 3) * 0.03;
            cContext.fill();
            
            cContext.beginPath();
            cContext.arc(x - size * 0.3, y - size * 0.3, size * 0.2, 0, Math.PI * 2);
            cContext.fillStyle = '#ffffff';
            cContext.globalAlpha = 0.12;
            cContext.fill();
        }
    } else if (biomeIndex === 1) { // Bosque: Hojas cayendo suavemente
        for (let i = 0; i < 15; i++) {
            const speedY = 18 + (i * 5) % 22;
            const size = 7 + (i * 2) % 9;
            const startX = (i * 73) % (w + 40) - 20;
            const y = ((time * 0.0008 * speedY + i * 97) % (h + 40)) - 20;
            const x = (startX + Math.sin(time * 0.001 * 2 + i) * 20) % (w + 40) - 20;
            const angle = time * 0.0012 + i;
            
            cContext.save();
            cContext.translate(x, y);
            cContext.rotate(angle);
            cContext.beginPath();
            cContext.ellipse(0, 0, size, size / 2.5, 0, 0, Math.PI * 2);
            cContext.fillStyle = b.active;
            cContext.globalAlpha = 0.06 + (i % 3) * 0.04;
            cContext.fill();
            cContext.restore();
        }
    } else if (biomeIndex === 2) { // Desierto: Viento y polvo en suspensión
        cContext.lineWidth = 1.2;
        for (let i = 0; i < 2; i++) {
            cContext.beginPath();
            cContext.strokeStyle = b.highlight;
            cContext.globalAlpha = 0.04 + i * 0.02;
            const waveOffset = time * 0.0004 * (i + 1);
            const baselineY = h * 0.3 + i * (h * 0.25);
            cContext.moveTo(-20, baselineY + Math.sin(waveOffset) * 15);
            for (let x = -20; x <= w + 20; x += 25) {
                const y = baselineY + Math.sin(x * 0.004 + waveOffset + i) * 20 + Math.cos(x * 0.002 - waveOffset) * 8;
                cContext.lineTo(x, y);
            }
            cContext.stroke();
        }
        for (let i = 0; i < 15; i++) {
            const speedX = 20 + (i * 6) % 25;
            const startY = (i * 109) % h;
            const x = (time * 0.0008 * speedX + i * 43) % (w + 40) - 20;
            const y = startY + Math.sin(time * 0.001 + i) * 10;
            cContext.beginPath();
            cContext.arc(x, y, 1.2, 0, Math.PI * 2);
            cContext.fillStyle = b.highlight;
            cContext.globalAlpha = 0.12 + (Math.sin(time * 0.002 + i) * 0.5 + 0.5) * 0.2;
            cContext.fill();
        }
    } else if (biomeIndex === 3) { // Ciudad: Polvo de neón digital cayendo de forma vertical
        for (let i = 0; i < 25; i++) {
            const speedY = 10 + (i * 5) % 15;
            const size = 1 + (i * 2) % 3;
            const startX = (i * 93) % w;
            const y = ((time * 0.0005 * speedY + i * 113) % (h + 20)) - 10;
            cContext.fillStyle = b.highlight;
            cContext.globalAlpha = 0.08 + (i % 4) * 0.05;
            cContext.fillRect(startX, y, size, size * 2);
        }
    } else if (biomeIndex === 4) { // Nieve: Copos de nieve flotando con oscilación horizontal
        for (let i = 0; i < 30; i++) {
            const speedY = 12 + (i * 6) % 20;
            const speedX = -4 + (i * 3) % 8;
            const size = 1.5 + (i * 2) % 3.5;
            const startX = (i * 127) % (w + 40) - 20;
            const y = ((time * 0.0008 * speedY + i * 47) % (h + 20)) - 10;
            let x = (startX + time * 0.0008 * speedX + Math.sin(time * 0.001 + i) * 15) % (w + 40) - 20;
            if (x < -20) x += (w + 40);
            
            cContext.beginPath();
            cContext.arc(x, y, size, 0, Math.PI * 2);
            cContext.fillStyle = '#ffffff';
            cContext.globalAlpha = 0.15 + (i % 4) * 0.12;
            cContext.fill();
        }
    } else { // Montaña: Nubes bajas de niebla en movimiento lento
        cContext.fillStyle = '#ffffff';
        for (let i = 0; i < 4; i++) {
            const speedX = 4 + i * 2;
            const startY = 40 + i * 60;
            const sizeW = 120 + i * 40;
            const sizeH = 30 + i * 10;
            const x = (time * 0.0002 * speedX + i * 250) % (w + sizeW * 2) - sizeW;
            
            cContext.globalAlpha = 0.03 + i * 0.02;
            cContext.beginPath();
            cContext.ellipse(x, startY, sizeW, sizeH, 0, 0, Math.PI * 2);
            cContext.fill();
        }
    }
    
    cContext.restore();
    cContext.restore();
}

/**
 * ============================================================================
 *                    CONFIGURACIÓN Y VARIABLES DE ESTADO
 * ============================================================================
 */
const cols = 10;
const rows = 8;
const cellSize = 48;
const cellWidth = cellSize;
const cellHeight = cellSize;
const topHeight = cellSize;
const depthHeight = 10;

const startX = Math.floor((canvas.width - (cols * cellWidth)) / 2);
const startY = Math.floor((canvas.height - (rows * cellHeight)) / 2) + 12;

let currentBiomeIndex = 0;
let currentLevel = 1; // 1 a 4: niveles estándar. 5: Nivel de Jefe
let gold = 0;
let lives = 2;
let extraHearts = 0;
let totalMines = 12;

let grid = [];
let particles = [];
let shakeDuration = 0;
let shakeIntensity = 0;
let activeTool = 'explore';

const frog = {
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

let gameState = 'START';
let mouseHoveredCell = { col: -1, row: -1 };

// Rastreo de coordenadas de ratón para efecto Parallax
let lastMouseX = canvas.width / 2;
let lastMouseY = canvas.height / 2;

// Temporizador del juego y marcas temporales
let levelStartTime = 0;
let levelElapsedTime = 0;
let completedLevelTimes = [null, null, null, null, null];

// Configuración del combate contra el Jefe de Bioma
let bossActive = false;
let bossHp = 0;
let bossMaxHp = 0;
let bossName = '';
let bossLastAttackTime = 0;
let bossAttackInterval = 12000;
let bossProjectiles = [];
let lastAmbientPlayTime = 0;

// Configuración de la animación y control de compresión del truco (Squash/Stretch)
let frogSqueezeScaleX = 1.0;
let frogSqueezeScaleY = 1.0;
let frogSqueezeCount = 0;

// Inventario de la tienda
const shopInventory = [
    { id: 'shield', name: 'Escudo de Faraday', desc: 'Te protege automáticamente de la próxima mina que pises.', cost: 6, icon: '🛡️', type: 'shield', quantity: 0 },
    { id: 'scanner', name: 'Escáner de Pulso', desc: 'Revela un área de 3x3 de forma segura sin detonar nada.', cost: 5, icon: '📡', type: 'active', quantity: 0 },
    { id: 'jump', name: 'Ancla de Salto', desc: 'Salta a cualquier casilla libre a un radio de 2 de distancia.', cost: 4, icon: '🪂', type: 'active', quantity: 0 }
];
let selectedActiveItem = null;

/**
 * ============================================================================
 *                    LÓGICA DEL MODAL E INICIALIZACIÓN
 * ============================================================================
 */

/**
 * Confirma el nombre ingresado para la rana y cierra el modal inicial.
 * Se expone en el objeto global 'window' para que sea invocable por los botones en el HTML.
 */
window.confirmFrogName = function() {
    const nameInput = DOM.frogNameInput;
    let chosenName = nameInput.value.trim();
    if (chosenName === '') {
        chosenName = 'Ranulfo';
    }
    frog.name = chosenName;
    DOM.frogNameDisplay.innerText = chosenName;
    
    DOM.nameModal.classList.add('hidden');
    bgm.start();
    sfx.playHeart();
};

/**
 * Inicializa la grilla vacía con las propiedades necesarias por cada baldosa.
 */
function initGrid() {
    grid = [];
    for (let c = 0; c < cols; c++) {
        grid[c] = [];
        for (let r = 0; r < rows; r++) {
            grid[c][r] = {
                isMine: false,
                isHeart: false,
                isCoin: false,
                isStone: false,
                stoneActivated: false,
                neighborMines: 0,
                visited: false,
                flagged: false,
                exploded: false,
                coinCollected: false,
                heartCollected: false,
                animDepth: depthHeight
            };
        }
    }
}

/**
 * Genera el tablero distribuyendo de forma segura minas, corazones, monedas e ítems de jefe
 * garantizando que la zona de inicio esté libre de peligros.
 * 
 * @param {number} firstClickedCol - Columna donde el jugador dio el primer clic seguro.
 * @param {number} firstClickedRow - Fila donde el jugador dio el primer clic seguro.
 */
function generateBoard(firstClickedCol, firstClickedRow) {
    initGrid();
    
    // Inicializar el Jefe si es nivel 5
    if (currentLevel === 5) {
        bossActive = true;
        const bossNames = [
            "Caimán del Fango",
            "Serpiente de Vides",
            "Escorpión de Arena",
            "Megadrón de Asfalto",
            "Abominable Yeti",
            "Dragón de Obsidiana"
        ];
        bossName = bossNames[currentBiomeIndex] || "Jefe Supremo";
        bossMaxHp = 6 + currentBiomeIndex * 2;
        bossHp = bossMaxHp;
        bossLastAttackTime = Date.now();
        bossAttackInterval = Math.max(5000, 12000 - currentBiomeIndex * 1500);
        bossProjectiles = [];
        bgm.setBossMode(true); // 🎵 Activar música de jefe
    } else {
        bossActive = false;
        bossHp = 0;
        bossProjectiles = [];
        bgm.setBossMode(false); // 🎵 Restaurar música normal del bioma
    }

    // Colocación aleatoria de minas (con una distancia segura mayor a 1 del punto de inicio)
    let placedMines = 0;
    while (placedMines < totalMines) {
        const randC = Math.floor(Math.random() * cols);
        const randR = Math.floor(Math.random() * rows);
        
        const distanceToStart = Math.max(Math.abs(randC - firstClickedCol), Math.abs(randR - firstClickedRow));
        
        if (distanceToStart > 1 && !grid[randC][randR].isMine) {
            grid[randC][randR].isMine = true;
            placedMines++;
        }
    }

    // Colocación de un Corazón de vida por nivel
    let heartPlaced = false;
    while (!heartPlaced) {
        const randC = Math.floor(Math.random() * cols);
        const randR = Math.floor(Math.random() * rows);
        
        if (!grid[randC][randR].isMine && Math.max(Math.abs(randC - firstClickedCol), Math.abs(randR - firstClickedRow)) > 1) {
            grid[randC][randR].isHeart = true;
            heartPlaced = true;
        }
    }

    // Colocación de Monedas de oro ocultas (3 a 6)
    const totalCoinsToPlace = 3 + Math.floor(Math.random() * 4);
    let coinsPlaced = 0;
    while (coinsPlaced < totalCoinsToPlace) {
        const randC = Math.floor(Math.random() * cols);
        const randR = Math.floor(Math.random() * rows);
        
        if (!grid[randC][randR].isMine && !grid[randC][randR].isHeart && Math.max(Math.abs(randC - firstClickedCol), Math.abs(randR - firstClickedRow)) > 1) {
            grid[randC][randR].isCoin = true;
            coinsPlaced++;
        }
    }

    // Colocación de piedras de catapulta (exclusivo del nivel de Jefe 5)
    if (currentLevel === 5) {
        let stonesToPlace = bossMaxHp;
        let stonesPlaced = 0;
        while (stonesPlaced < stonesToPlace) {
            const randC = Math.floor(Math.random() * cols);
            const randR = Math.floor(Math.random() * rows);
            
            if (!grid[randC][randR].isMine && 
                !grid[randC][randR].isHeart && 
                !grid[randC][randR].isCoin && 
                !grid[randC][randR].isStone && 
                Math.max(Math.abs(randC - firstClickedCol), Math.abs(randR - firstClickedRow)) > 1) {
                grid[randC][randR].isStone = true;
                stonesPlaced++;
            }
        }
    }

    // Calcular minas circundantes para todas las celdas
    for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
            if (grid[c][r].isMine) continue;
            let count = 0;
            for (let dc = -1; dc <= 1; dc++) {
                for (let dr = -1; dr <= 1; dr++) {
                    const nc = c + dc;
                    const nr = r + dr;
                    if (nc >= 0 && nc < cols && nr >= 0 && nr < rows) {
                        if (grid[nc][nr].isMine) count++;
                    }
                }
            }
            grid[c][r].neighborMines = count;
        }
    }
}

/**
 * ============================================================================
 *                    ALGORITMOS DE NAVEGACIÓN Y MATEMÁTICAS
 * ============================================================================
 */

/**
 * Calcula la ruta transitable más corta (BFS) desde un punto de inicio a un destino.
 * Las celdas deben estar descubiertas o ser el destino final inexplorado sin bandera.
 * 
 * @param {number} startCol - Columna origen.
 * @param {number} startRow - Fila origen.
 * @param {number} targetCol - Columna de destino.
 * @param {number} targetRow - Fila de destino.
 * @returns {Array<{col:number, row:number}>} Lista de celdas que forman la ruta óptima.
 */
function calculatePath(startCol, startRow, targetCol, targetRow) {
    if (startCol === targetCol && startRow === targetRow) return [];

    const queue = [[{ col: startCol, row: startRow }]];
    const visitedSet = new Set();
    visitedSet.add(`${startCol},${startRow}`);

    while (queue.length > 0) {
        const currentPath = queue.shift();
        const currentCell = currentPath[currentPath.length - 1];

        if (currentCell.col === targetCol && currentCell.row === targetRow) {
            return currentPath;
        }

        const directions = [
            { dc: 0, dr: -1 }, // Norte
            { dc: 0, dr: 1 },  // Sur
            { dc: -1, dr: 0 }, // Oeste
            { dc: 1, dr: 0 }   // Este
        ];

        for (const d of directions) {
            const nextC = currentCell.col + d.dc;
            const nextR = currentCell.row + d.dr;

            if (nextC >= 0 && nextC < cols && nextR >= 0 && nextR < rows) {
                const key = `${nextC},${nextR}`;
                if (!visitedSet.has(key)) {
                    const tile = grid[nextC][nextR];
                    const isFinalStep = (nextC === targetCol && nextR === targetRow);

                    // Tránsito permitido si es descubierta o el destino final inexplorado sin bandera
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

/**
 * Traduce coordenadas lógicas de grilla (columna, fila) a coordenadas de pantalla en píxeles.
 * 
 * @param {number} col - Columna de la grilla.
 * @param {number} row - Fila de la grilla.
 * @returns {{x:number, y:number}} Coordenadas X e Y de pantalla de la baldosa.
 */
function gridToScreen(col, row) {
    return {
        x: startX + col * cellWidth,
        y: startY + row * cellHeight
    };
}

/**
 * Detecta y devuelve la celda correspondiente si los píxeles (mouseX, mouseY) caen sobre una baldosa 3D.
 * 
 * @param {number} mouseX - Coordenada X del cursor en el lienzo.
 * @param {number} mouseY - Coordenada Y del cursor en el lienzo.
 * @returns {{col:number, row:number}|null} Celda de la grilla o null si está fuera del tablero.
 */
function screenToGrid(mouseX, mouseY) {
    for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
            const screenPos = gridToScreen(c, r);
            const isSunken = grid[c][r].visited || grid[c][r].exploded;
            const depth = isSunken ? 0 : depthHeight;
            const topY = screenPos.y - depth;
            
            if (mouseX >= screenPos.x && mouseX <= screenPos.x + cellWidth &&
                mouseY >= topY && mouseY <= topY + topHeight) {
                return { col: c, row: r };
            }
        }
    }
    return null;
}

/**
 * Determina si una baldosa está dentro del faro de visión de la rana (radio 3x3).
 * 
 * @param {number} col - Columna evaluada.
 * @param {number} row - Fila evaluada.
 * @returns {boolean} Verdadero si está a un radio de 1 de distancia de la rana.
 */
function isWithinVision(col, row) {
    if (!frog.isSpawned) return false;
    return Math.abs(col - frog.col) <= 1 && Math.abs(row - frog.row) <= 1;
}

/**
 * Cuenta las celdas seguras que han sido reveladas contra el total de celdas seguras del tablero.
 * 
 * @returns {{revealed:number, total:number}} Cantidad de celdas reveladas y celdas seguras totales.
 */
function getGameProgress() {
    let safeTotal = 0;
    let safeRevealed = 0;
    for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
            if (!grid[c][r].isMine) {
                safeTotal++;
                if (grid[c][r].visited) {
                    safeRevealed++;
                }
            }
        }
    }
    return { revealed: safeRevealed, total: safeTotal };
}

/**
 * Actualiza la información textual del progreso en el elemento de la interfaz de usuario.
 */
function updateProgressUI() {
    const progress = getGameProgress();
    DOM.progressDisplay.innerText = `${progress.revealed} / ${progress.total}`;
}

/**
 * ============================================================================
 *                    SISTEMA DE PARTÍCULAS
 * ============================================================================
 */

/**
 * @class Particle
 * @description Representa una partícula visual animada en el tablero con gravedad e historia de rastro.
 */
class Particle {
    /**
     * @param {number} x - Coordenada X inicial en pantalla.
     * @param {number} y - Coordenada Y inicial en pantalla.
     * @param {string} color - Color hexadecimal de la partícula.
     * @param {string} [type='spark'] - Tipo de partícula ('spark', 'heart', 'star').
     */
    constructor(x, y, color, type = 'spark') {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 8;
        this.vy = (Math.random() - 0.5) * 8 - (type === 'heart' ? 3 : 0);
        this.color = color;
        this.life = 1.0;
        this.decay = 0.015 + Math.random() * 0.02;
        this.size = 2 + Math.random() * 5;
        this.type = type;
        this.history = [];
    }

    /**
     * Actualiza la física de la partícula (gravedad, rastro y ciclo de vida).
     */
    update() {
        this.history.push({ x: this.x, y: this.y });
        if (this.history.length > 6) this.history.shift();
        this.x += this.vx;
        this.y += this.vy;
        
        if (this.type === 'heart') {
            this.vy -= 0.05;
        } else if (this.type === 'star') {
            this.vy += 0.05;
        } else {
            this.vy += 0.2; // Gravedad terrestre para chispas normales
        }
        this.life -= this.decay;
    }

    /**
     * Dibuja la partícula y su rastro animado en el contexto del canvas.
     * 
     * @param {CanvasRenderingContext2D} cContext - Contexto del Canvas donde dibujar.
     */
    draw(cContext) {
        cContext.save();
        cContext.globalAlpha = this.life;
        
        if (this.type === 'heart') {
            cContext.fillStyle = this.color;
            cContext.font = `${this.size * 3}px Arial`;
            cContext.fillText('❤️', this.x, this.y);
        } else if (this.type === 'star') {
            cContext.fillStyle = this.color;
            cContext.font = `${this.size * 2}px Arial`;
            cContext.fillText('⭐', this.x, this.y);
        } else {
            if (this.history.length > 1) {
                cContext.beginPath();
                cContext.moveTo(this.history[0].x, this.history[0].y);
                for (let i = 1; i < this.history.length; i++) {
                    cContext.lineTo(this.history[i].x, this.history[i].y);
                }
                cContext.strokeStyle = this.color;
                cContext.lineWidth = this.size;
                cContext.lineCap = 'round';
                cContext.stroke();
            } else {
                cContext.fillStyle = this.color;
                cContext.beginPath();
                cContext.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                cContext.fill();
            }
        }
        cContext.restore();
    }
}

/**
 * Genera partículas animadas utilizando la clase base consolidada.
 * 
 * @param {number} x - Coordenada X central de emisión.
 * @param {number} y - Coordenada Y central de emisión.
 * @param {string|string[]} colors - Un color o un array de colores para aleatorizar.
 * @param {number} count - Número de partículas a emitir.
 * @param {string} [type='spark'] - Tipo de partículas.
 */
function spawnParticles(x, y, colors, count, type = 'spark') {
    const isArray = Array.isArray(colors);
    for (let i = 0; i < count; i++) {
        const color = isArray ? colors[Math.floor(Math.random() * colors.length)] : colors;
        particles.push(new Particle(x, y, color, type));
    }
}

/**
 * Dispara una explosión espectacular de chispas ardientes.
 * 
 * @param {number} x - Coordenada X del evento.
 * @param {number} y - Coordenada Y del evento.
 */
function spawnExplosionParticles(x, y) {
    spawnParticles(x, y, ['#f87171', '#f59e0b', '#ef4444', '#facc15', '#ffffff'], 35, 'spark');
}

/**
 * Dispara ráfagas de corazones ascendentes.
 * 
 * @param {number} x - Coordenada X del evento.
 * @param {number} y - Coordenada Y del evento.
 */
function spawnHeartParticles(x, y) {
    spawnParticles(x, y, '#ef4444', 15, 'heart');
}

/**
 * Dispara una constelación de estrellas de oro.
 * 
 * @param {number} x - Coordenada X del evento.
 * @param {number} y - Coordenada Y del evento.
 */
function spawnCoinParticles(x, y) {
    spawnParticles(x, y, '#fbbf24', 12, 'star');
}

/**
 * Activa un efecto sísmico (vibración) de la pantalla temporalmente.
 * 
 * @param {number} duration - Duración en frames del temblor.
 * @param {number} intensity - Amplitud máxima en píxeles del temblor.
 */
function triggerScreenShake(duration, intensity) {
    shakeDuration = duration;
    shakeIntensity = intensity;
}

/**
 * ============================================================================
 *                    DISEÑOS VECTORIALES DE ENTIDADES
 * ============================================================================
 */

/**
 * Dibuja al héroe "Ranulfo" en el lienzo con animaciones de respiración,
 * parpadeo dinámico, orientación de pupilas y efectos de aplastamiento (Squash/Stretch).
 * 
 * @param {CanvasRenderingContext2D} cContext - Contexto de renderizado del lienzo.
 * @param {number} x - Coordenada X actual.
 * @param {number} y - Coordenada Y actual.
 */
function drawFrogHero(cContext, x, y) {
    cContext.save();
    cContext.translate(x + cellWidth / 2, y + cellHeight / 2 - 8);

    // Sombra proyectada en el suelo
    cContext.fillStyle = 'rgba(0, 0, 0, 0.45)';
    cContext.beginPath();
    cContext.ellipse(0, 15, 15, 6, 0, 0, Math.PI * 2);
    cContext.fill();

    const time = Date.now();
    const animWave = frog.isMoving ? Math.sin(time * 0.015) : Math.sin(time * 0.003) * 0.3;
    const isBlinking = (time % 4000) < 150; // Parpadeo corto cada 4s
    const tilt = animWave * 0.05;
    cContext.rotate(tilt);

    // Suavizado del factor Squash & Stretch (lerp gradual de vuelta a la escala original 1.0)
    frogSqueezeScaleX += (1.0 - frogSqueezeScaleX) * 0.15;
    frogSqueezeScaleY += (1.0 - frogSqueezeScaleY) * 0.15;
    cContext.scale(frogSqueezeScaleX, frogSqueezeScaleY);

    // Patas traseras de rana
    cContext.fillStyle = '#10b981';
    cContext.beginPath();
    cContext.ellipse(-11 + animWave * 2, 10, 7, 4, -0.3, 0, Math.PI * 2);
    cContext.ellipse(11 - animWave * 2, 10, 7, 4, 0.3, 0, Math.PI * 2);
    cContext.fill();

    // Patas inferiores (doradas)
    cContext.fillStyle = '#fbbf24';
    cContext.beginPath();
    cContext.ellipse(-13 + animWave * 2, 11, 3.5, 2, 0, 0, Math.PI * 2);
    cContext.ellipse(13 - animWave * 2, 11, 3.5, 2, 0, 0, Math.PI * 2);
    cContext.fill();

    // Cuerpo principal
    cContext.fillStyle = '#059669';
    cContext.beginPath();
    cContext.arc(0, 0, 11, 0, Math.PI * 2);
    cContext.fill();

    // Pancita
    cContext.fillStyle = '#fef08a';
    cContext.beginPath();
    cContext.ellipse(0, 2, 7, 8, 0, 0, Math.PI * 2);
    cContext.fill();

    // Cabeza
    cContext.fillStyle = '#10b981';
    cContext.beginPath();
    cContext.arc(0, -8, 9, 0, Math.PI * 2);
    cContext.fill();

    // Ojos saltones
    cContext.fillStyle = '#10b981';
    cContext.beginPath();
    cContext.arc(-5, -15, 4.5, 0, Math.PI * 2);
    cContext.arc(5, -15, 4.5, 0, Math.PI * 2);
    cContext.fill();

    if (isBlinking) {
        cContext.fillStyle = '#059669'; // Párpado cerrado
        cContext.beginPath();
        cContext.rect(-8, -17, 16, 5);
        cContext.fill();
    } else {
        cContext.fillStyle = '#ffffff';
        cContext.beginPath();
        cContext.arc(-5, -15, 3, 0, Math.PI * 2);
        cContext.arc(5, -15, 3, 0, Math.PI * 2);
        cContext.fill();

        cContext.fillStyle = '#000000';
        cContext.beginPath();
        // Dirección de la mirada según orientación de movimiento
        const px = frog.direction === 'left' ? -1 : (frog.direction === 'right' ? 1 : 0);
        cContext.arc(-5 + px, -15, 1.5, 0, Math.PI * 2);
        cContext.arc(5 + px, -15, 1.5, 0, Math.PI * 2);
        cContext.fill();
    }

    // Vincha roja aventurera
    cContext.fillStyle = '#ef4444';
    cContext.beginPath();
    cContext.rect(-8, -13, 16, 2.5);
    cContext.fill();
    cContext.beginPath();
    cContext.moveTo(-7, -12);
    cContext.lineTo(-13, -9 + Math.sin(Date.now() * 0.01) * 2);
    cContext.lineTo(-11, -7);
    cContext.closePath();
    cContext.fill();

    // Dibujar órbita protectora del Escudo de Faraday si está equipado
    const activeShield = shopInventory.find(i => i.id === 'shield');
    if (activeShield && activeShield.quantity > 0) {
        cContext.strokeStyle = '#38bdf8';
        cContext.lineWidth = 1.5;
        cContext.shadowColor = '#0284c7';
        cContext.shadowBlur = 6;
        cContext.beginPath();
        const shieldAngle = Date.now() * 0.003;
        const sx = Math.cos(shieldAngle) * 18;
        const sy = Math.sin(shieldAngle) * 18;
        cContext.arc(sx, sy, 3, 0, Math.PI * 2);
        cContext.fillStyle = '#e0f2fe';
        cContext.fill();
        cContext.stroke();
    }

    cContext.restore();
}

/**
 * Dibuja los restos de una mina detonada (cráter y fuego).
 * 
 * @param {CanvasRenderingContext2D} cContext - Contexto del Canvas.
 * @param {number} x - Coordenada X de pantalla.
 * @param {number} y - Coordenada Y de pantalla.
 */
function drawExplodedMine(cContext, x, y) {
    cContext.save();
    cContext.fillStyle = '#27272a';
    cContext.beginPath();
    cContext.ellipse(x + cellWidth / 2, y + topHeight / 2, 16, 9, 0, 0, Math.PI * 2);
    cContext.fill();

    cContext.fillStyle = '#ef4444';
    cContext.beginPath();
    cContext.ellipse(x + cellWidth / 2, y + topHeight / 2, 10, 5, 0, 0, Math.PI * 2);
    cContext.fill();
    cContext.fillStyle = '#fbbf24';
    cContext.beginPath();
    cContext.ellipse(x + cellWidth / 2, y + topHeight / 2, 5, 2.5, 0, 0, Math.PI * 2);
    cContext.fill();
    cContext.restore();
}

/**
 * Dibuja una mina desactivada o visible sin estallar (diseño clásico con picos y led parpadeante).
 * 
 * @param {CanvasRenderingContext2D} cContext - Contexto del Canvas.
 * @param {number} x - Coordenada X.
 * @param {number} y - Coordenada Y.
 */
function drawUnexplodedMine(cContext, x, y) {
    cContext.save();
    cContext.translate(x + cellWidth / 2, y + topHeight / 2);
    
    // Picos de detonación
    cContext.strokeStyle = '#3f3f46';
    cContext.lineWidth = 3;
    const spikes = 8;
    for (let i = 0; i < spikes; i++) {
        const angle = (i * Math.PI * 2) / spikes;
        cContext.beginPath();
        cContext.moveTo(0, 0);
        cContext.lineTo(Math.cos(angle) * 14, Math.sin(angle) * 14);
        cContext.stroke();
    }

    // Esfera central de hierro
    cContext.fillStyle = '#18181b';
    cContext.strokeStyle = '#52525b';
    cContext.lineWidth = 1.5;
    cContext.beginPath();
    cContext.arc(0, 0, 10, 0, Math.PI * 2);
    cContext.fill();
    cContext.stroke();

    // LED rojo intermitente
    const redPulse = 0.5 + Math.sin(Date.now() * 0.01) * 0.5;
    cContext.fillStyle = `rgba(239, 68, 68, ${redPulse})`;
    cContext.shadowColor = '#ef4444';
    cContext.shadowBlur = 4;
    cContext.beginPath();
    cContext.arc(-2.5, -2.5, 2.5, 0, Math.PI * 2);
    cContext.fill();
    
    cContext.restore();
}

/**
 * Dibuja un corazón flotante en el tablero 3D con un efecto de latido y rebote.
 * 
 * @param {CanvasRenderingContext2D} cContext - Contexto del Canvas.
 * @param {number} x - Posición X.
 * @param {number} y - Posición Y.
 */
function drawHeartEntity(cContext, x, y) {
    cContext.save();
    const pulse = 1 + Math.sin(Date.now() / 150) * 0.1;
    cContext.translate(x + cellWidth / 2, y + topHeight / 2);
    cContext.scale(pulse, pulse);

    cContext.fillStyle = '#ef4444';
    cContext.beginPath();
    cContext.moveTo(0, 3);
    cContext.bezierCurveTo(-4, -2, -8, -2, -8, 3);
    cContext.bezierCurveTo(-8, 7, -4, 9, 0, 13);
    cContext.bezierCurveTo(4, 9, 8, 7, 8, 3);
    cContext.bezierCurveTo(8, -2, 4, -2, 0, 3);
    cContext.fill();
    cContext.restore();
}

/**
 * Dibuja una moneda giratoria en el tablero 3D.
 * 
 * @param {CanvasRenderingContext2D} cContext - Contexto del Canvas.
 * @param {number} x - Posición X.
 * @param {number} y - Posición Y.
 */
function drawCoinEntity(cContext, x, y) {
    cContext.save();
    const bounce = Math.sin(Date.now() / 100) * 2;
    const spin = Math.sin(Date.now() / 80);
    cContext.translate(x + cellWidth / 2, y + topHeight / 2 + bounce);
    cContext.scale(spin, 1);

    cContext.fillStyle = '#d97706';
    cContext.beginPath();
    cContext.arc(0, 0, 6, 0, Math.PI * 2);
    cContext.fill();

    cContext.fillStyle = '#fbbf24';
    cContext.beginPath();
    cContext.arc(0, 0, 5, 0, Math.PI * 2);
    cContext.fill();
    cContext.restore();
}

/**
 * Dibuja una bandera de demarcación sobre baldosas sospechosas.
 * 
 * @param {CanvasRenderingContext2D} cContext - Contexto del Canvas.
 * @param {number} x - Posición X.
 * @param {number} y - Posición Y.
 */
function drawFlagEntity(cContext, x, y) {
    cContext.save();
    cContext.translate(x + cellWidth / 2, y + topHeight / 2);
    
    cContext.strokeStyle = '#9ca3af';
    cContext.lineWidth = 2;
    cContext.beginPath();
    cContext.moveTo(-3, 8);
    cContext.lineTo(-3, -10);
    cContext.stroke();

    cContext.fillStyle = '#f87171';
    cContext.beginPath();
    cContext.moveTo(-3, -10);
    cContext.lineTo(7, -6 + Math.sin(Date.now() * 0.01) * 1.5);
    cContext.lineTo(-3, -2);
    cContext.closePath();
    cContext.fill();

    cContext.fillStyle = '#facc15';
    cContext.beginPath();
    cContext.arc(-3, -10, 2, 0, Math.PI * 2);
    cContext.fill();

    cContext.restore();
}

/**
 * ============================================================================
 *                    LÓGICA Y FÍSICA DEL COMBATE DE BOSS
 * ============================================================================
 */

/**
 * @class StoneProjectile
 * @description Controla la trayectoria parabólica en 3D de las rocas arrojadas por las catapultas al jefe.
 */
class StoneProjectile {
    /**
     * @param {number} startX - Coordenada X inicial.
     * @param {number} startY - Coordenada Y inicial.
     * @param {number} targetX - Coordenada X del jefe.
     * @param {number} targetY - Coordenada Y del jefe.
     */
    constructor(startX, startY, targetX, targetY) {
        this.x = startX;
        this.y = startY;
        this.targetX = targetX;
        this.targetY = targetY;
        this.progress = 0; // Transición de 0.0 a 1.0 (aprox. 50 fotogramas)
        this.size = 8;
        this.angle = Math.random() * Math.PI * 2;
        this.rotSpeed = (Math.random() - 0.5) * 0.1;
        this.curX = startX;
        this.curY = startY;
    }
    
    /**
     * Actualiza el progreso lineal y calcula la posición en el arco parabólico.
     */
    update() {
        this.progress += 0.02;
        if (this.progress > 1) this.progress = 1;
        
        const t = this.progress;
        this.curX = (1 - t) * this.x + t * this.targetX;
        
        const lineY = (1 - t) * this.y + t * this.targetY;
        const arcHeight = 120 * Math.sin(t * Math.PI); // Desplazamiento vertical de arco
        this.curY = lineY - arcHeight;
        
        this.angle += this.rotSpeed;
    }
    
    /**
     * Dibuja la piedra y sus sombras en el contexto.
     * 
     * @param {CanvasRenderingContext2D} cContext - Contexto del Canvas.
     */
    draw(cContext) {
        cContext.save();
        cContext.translate(this.curX, this.curY);
        cContext.rotate(this.angle);
        
        cContext.fillStyle = '#64748b';
        cContext.strokeStyle = '#475569';
        cContext.lineWidth = 1.5;
        
        cContext.beginPath();
        cContext.moveTo(-this.size, 0);
        cContext.lineTo(-this.size / 2, -this.size);
        cContext.lineTo(this.size / 2, -this.size);
        cContext.lineTo(this.size, -this.size / 2);
        cContext.lineTo(this.size, this.size / 2);
        cContext.lineTo(0, this.size);
        cContext.closePath();
        cContext.fill();
        cContext.stroke();
        
        cContext.fillStyle = '#94a3b8';
        cContext.beginPath();
        cContext.ellipse(-this.size / 3, -this.size / 3, this.size / 3, this.size / 4, 0.5, 0, Math.PI * 2);
        cContext.fill();
        
        cContext.restore();
    }
}

/**
 * Dibuja el altar o catapulta de piedra rúnica.
 * 
 * @param {CanvasRenderingContext2D} cContext - Contexto del Canvas.
 * @param {number} x - Posición X.
 * @param {number} y - Posición Y.
 */
function drawStoneEntity(cContext, x, y) {
    cContext.save();
    cContext.translate(x + cellWidth / 2, y + topHeight / 2);
    
    cContext.fillStyle = '#64748b';
    cContext.strokeStyle = '#475569';
    cContext.lineWidth = 1.5;
    
    cContext.beginPath();
    cContext.moveTo(-10, 2);
    cContext.lineTo(-6, -10);
    cContext.lineTo(6, -10);
    cContext.lineTo(10, 2);
    cContext.lineTo(0, 8);
    cContext.closePath();
    cContext.fill();
    cContext.stroke();
    
    // Runa mágica azul resplandeciente
    cContext.strokeStyle = '#38bdf8';
    cContext.lineWidth = 1.2;
    cContext.beginPath();
    cContext.moveTo(-3, -2);
    cContext.lineTo(3, -2);
    cContext.moveTo(0, -6);
    cContext.lineTo(0, 2);
    cContext.stroke();
    
    cContext.restore();
}

/**
 * Dibuja los gráficos vectoriales dinámicos del Jefe de Bioma correspondiente.
 * 
 * @param {CanvasRenderingContext2D} cContext - Contexto del Canvas.
 * @param {number} x - Coordenada X central de anclaje.
 * @param {number} y - Coordenada Y central de anclaje.
 * @param {number} biomeIndex - Bioma actual (0 a 5).
 * @param {number} time - Marca de tiempo para flotación.
 */
function drawBossEntity(cContext, x, y, biomeIndex, time) {
    cContext.save();
    cContext.translate(x, y);
    
    // Movimiento oscilante vertical
    const floatY = Math.sin(time * 0.003) * 6;
    cContext.translate(0, floatY);
    
    // Sombra del jefe
    cContext.fillStyle = 'rgba(0, 0, 0, 0.3)';
    cContext.beginPath();
    cContext.ellipse(0, 50, 25, 6, 0, 0, Math.PI * 2);
    cContext.fill();

    cContext.shadowBlur = 10;
    
    if (biomeIndex === 0) { // Caimán (Swamp)
        cContext.shadowColor = '#10b981';
        cContext.fillStyle = '#064e3b';
        cContext.beginPath();
        cContext.moveTo(-20, 20);
        cContext.lineTo(20, 20);
        cContext.lineTo(15, -10);
        cContext.lineTo(-15, -10);
        cContext.closePath();
        cContext.fill();
        
        cContext.fillStyle = '#047857';
        cContext.beginPath();
        cContext.ellipse(0, -5, 18, 12, 0, 0, Math.PI * 2);
        cContext.fill();
        
        cContext.fillStyle = '#065f46';
        cContext.fillRect(-12, -2, 24, 15);
        
        cContext.fillStyle = '#fbbf24';
        cContext.beginPath();
        cContext.arc(-6, -8, 3, 0, Math.PI * 2);
        cContext.arc(6, -8, 3, 0, Math.PI * 2);
        cContext.fill();
        cContext.fillStyle = '#dc2626';
        cContext.beginPath();
        cContext.arc(-6, -8, 1, 0, Math.PI * 2);
        cContext.arc(6, -8, 1, 0, Math.PI * 2);
        cContext.fill();
        
    } else if (biomeIndex === 1) { // Serpiente (Forest)
        cContext.shadowColor = '#22c55e';
        cContext.strokeStyle = '#14532d';
        cContext.lineWidth = 12;
        cContext.lineCap = 'round';
        cContext.beginPath();
        cContext.arc(0, 15, 20, 0, Math.PI * 1.5);
        cContext.stroke();
        
        cContext.fillStyle = '#15803d';
        cContext.beginPath();
        cContext.ellipse(0, -10, 14, 10, 0, 0, Math.PI * 2);
        cContext.fill();
        
        cContext.fillStyle = '#ef4444';
        cContext.beginPath();
        cContext.arc(-4, -12, 2, 0, Math.PI * 2);
        cContext.arc(4, -12, 2, 0, Math.PI * 2);
        cContext.fill();
        
        cContext.strokeStyle = '#dc2626';
        cContext.lineWidth = 1.5;
        cContext.beginPath();
        cContext.moveTo(0, 0);
        cContext.lineTo(0, 8);
        cContext.moveTo(0, 8);
        cContext.lineTo(-3, 11);
        cContext.moveTo(0, 8);
        cContext.lineTo(3, 11);
        cContext.stroke();
        
    } else if (biomeIndex === 2) { // Escorpión (Desert)
        cContext.shadowColor = '#ea580c';
        cContext.strokeStyle = '#9a3412';
        cContext.lineWidth = 6;
        cContext.beginPath();
        cContext.moveTo(0, 10);
        cContext.quadraticCurveTo(20, -10, 5, -25);
        cContext.stroke();
        
        cContext.fillStyle = '#ea580c';
        cContext.beginPath();
        cContext.arc(5, -25, 4, 0, Math.PI * 2);
        cContext.fill();
        
        cContext.fillStyle = '#7c2d12';
        cContext.beginPath();
        cContext.ellipse(0, 5, 16, 12, 0, 0, Math.PI * 2);
        cContext.fill();
        
        cContext.strokeStyle = '#7c2d12';
        cContext.lineWidth = 4;
        cContext.beginPath();
        cContext.moveTo(-10, 5);
        cContext.lineTo(-20, -5);
        cContext.moveTo(10, 5);
        cContext.lineTo(20, -5);
        cContext.stroke();
        
        cContext.fillStyle = '#9a3412';
        cContext.beginPath();
        cContext.arc(-20, -5, 4, 0, Math.PI * 2);
        cContext.arc(20, -5, 4, 0, Math.PI * 2);
        cContext.fill();
        
    } else if (biomeIndex === 3) { // Megadrón (City)
        cContext.shadowColor = '#6366f1';
        cContext.fillStyle = '#3730a3';
        cContext.beginPath();
        cContext.arc(0, -5, 16, 0, Math.PI * 2);
        cContext.fill();
        
        cContext.fillStyle = '#1e1b4b';
        cContext.fillRect(-22, -8, 44, 4);
        
        cContext.fillStyle = '#dc2626';
        cContext.shadowColor = '#ef4444';
        cContext.shadowBlur = 12;
        cContext.beginPath();
        cContext.arc(0, -5, 5, 0, Math.PI * 2);
        cContext.fill();
        cContext.shadowBlur = 0;
        
        cContext.fillStyle = '#818cf8';
        cContext.fillRect(-10, 11, 4, 6);
        cContext.fillRect(6, 11, 4, 6);
        
        cContext.fillStyle = '#a5b4fc';
        cContext.globalAlpha = 0.6;
        cContext.beginPath();
        cContext.arc(-8, 20 + Math.sin(time * 0.025) * 3, 2, 0, Math.PI * 2);
        cContext.arc(8, 20 + Math.sin(time * 0.025) * 3, 2, 0, Math.PI * 2);
        cContext.fill();
        
    } else if (biomeIndex === 4) { // Yeti (Snow)
        cContext.shadowColor = '#06b6d4';
        cContext.fillStyle = '#e2e8f0';
        cContext.beginPath();
        cContext.arc(0, -5, 20, 0, Math.PI * 2);
        cContext.fill();
        
        cContext.fillStyle = '#0891b2';
        cContext.beginPath();
        cContext.moveTo(-16, -15);
        cContext.quadraticCurveTo(-24, -24, -12, -26);
        cContext.lineTo(-12, -20);
        cContext.closePath();
        cContext.fill();
        
        cContext.beginPath();
        cContext.moveTo(16, -15);
        cContext.quadraticCurveTo(24, -24, 12, -26);
        cContext.lineTo(12, -20);
        cContext.closePath();
        cContext.fill();
        
        cContext.fillStyle = '#cbd5e1';
        cContext.beginPath();
        cContext.ellipse(0, -2, 12, 8, 0, 0, Math.PI * 2);
        cContext.fill();
        
        cContext.fillStyle = '#eab308';
        cContext.beginPath();
        cContext.arc(-5, -3, 2, 0, Math.PI * 2);
        cContext.arc(5, -3, 2, 0, Math.PI * 2);
        cContext.fill();
        
    } else { // Dragón de Obsidiana (Mountain)
        cContext.shadowColor = '#ef4444';
        cContext.fillStyle = '#1c1917';
        cContext.beginPath();
        cContext.moveTo(10, 30);
        cContext.lineTo(-15, 10);
        cContext.lineTo(5, -15);
        cContext.lineTo(25, -10);
        cContext.closePath();
        cContext.fill();
        
        cContext.fillStyle = '#292524';
        cContext.beginPath();
        cContext.moveTo(5, -15);
        cContext.lineTo(-18, -25);
        cContext.lineTo(-24, -10);
        cContext.lineTo(5, -5);
        cContext.closePath();
        cContext.fill();
        
        cContext.fillStyle = '#ef4444';
        cContext.beginPath();
        cContext.moveTo(5, -15);
        cContext.lineTo(12, -25);
        cContext.lineTo(10, -10);
        cContext.fill();
        
        cContext.fillStyle = '#f97316';
        cContext.beginPath();
        cContext.arc(-8, -17, 2.5, 0, Math.PI * 2);
        cContext.fill();
    }
    
    cContext.restore();
}

/**
 * Dibuja el número indicador de minas adyacentes con colores específicos retro.
 * 
 * @param {CanvasRenderingContext2D} cContext - Contexto del Canvas.
 * @param {number} val - Cantidad de minas vecinas.
 * @param {number} x - Coordenada X.
 * @param {number} y - Coordenada Y.
 */
function drawNumberIndicator(cContext, val, x, y) {
    cContext.save();
    cContext.font = 'bold 15px Orbitron, sans-serif';
    cContext.textAlign = 'center';
    cContext.textBaseline = 'middle';

    const colors = {
        1: '#60a5fa', 2: '#4ade80', 3: '#f87171', 4: '#c084fc',
        5: '#fb923c', 6: '#22d3ee', 7: '#f472b6', 8: '#facc15'
    };

    cContext.fillStyle = colors[val] || '#ffffff';
    cContext.shadowColor = colors[val] || '#000000';
    cContext.shadowBlur = 3;
    cContext.fillText(val, x + cellWidth / 2, y + topHeight / 2);
    cContext.restore();
}

/**
 * ============================================================================
 *                    LÓGICA DEL MAPA DE NIVELES (CAMINITO)
 * ============================================================================
 */

/**
 * Actualiza visualmente el mapa del "caminito" de niveles, mostrando insignias de bioma,
 * bordes brillantes del canvas y las marcas de tiempo para cada nivel superado.
 */
function updateLevelMapUI() {
    const biome = BIOMES[currentBiomeIndex];
    
    // Insignia del Bioma
    const badge = DOM.biomeBadge;
    badge.innerText = biome.name;
    badge.className = `text-xs font-bold px-3 py-1.5 rounded-full border uppercase tracking-widest transition-all ${biome.badgeStyle}`;
    
    // Contenedor del Canvas
    const canvasWrapper = DOM.canvasWrapper;
    canvasWrapper.className = `relative bg-gray-950 rounded-2xl border-2 overflow-hidden shadow-2xl flex items-center justify-center flex-grow min-h-[480px] transition-all duration-500 ${biome.wrapperBorder}`;
    canvasWrapper.style.backgroundColor = biome.unexplored;
    canvasWrapper.style.backgroundSize = 'cover';
    canvasWrapper.style.backgroundPosition = 'center';
    canvasWrapper.style.boxShadow = `0 10px 30px -10px ${biome.glowColor}`;

    // Nivel en Header
    DOM.levelDisplay.innerText = `${biome.name} - Lvl ${currentLevel === 5 ? 'Boss' : currentLevel}`;

    // Construir nodos del mapa de progreso (niveles 1 a 5)
    const mapContainer = DOM.caminitoContainer;
    mapContainer.innerHTML = '';
    
    for (let i = 1; i <= 5; i++) {
        const isBoss = (i === 5);
        const isCompleted = (i < currentLevel);
        const isActive = (i === currentLevel);
        
        const wrapper = document.createElement('div');
        wrapper.className = 'flex flex-col items-center justify-center relative';
        
        const timeLabel = document.createElement('div');
        timeLabel.className = 'absolute -top-5 text-[9px] font-mono text-yellow-400 font-bold whitespace-nowrap bg-gray-950/80 px-1 py-0.5 rounded border border-yellow-500/10 pointer-events-none transition-all duration-300';
        
        if (completedLevelTimes[i - 1]) {
            timeLabel.innerText = completedLevelTimes[i - 1];
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
            node.className = `w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 border-2 ${
                isActive 
                ? 'bg-red-600 border-white text-white shadow-lg shadow-red-500/50 scale-110 animate-pulse' 
                : isCompleted 
                ? 'bg-red-950 border-red-500 text-red-400' 
                : 'bg-gray-950 border-gray-800 text-gray-600'
            }`;
            node.innerHTML = '<i class="ph ph-crown text-sm"></i>';
        } else {
            node.className = `w-14 h-8 rounded-lg flex flex-col items-center justify-center text-[10px] font-bold transition-all duration-300 border ${
                isActive 
                ? 'bg-emerald-500 border-white text-black shadow-lg shadow-emerald-500/40 scale-105' 
                : isCompleted 
                ? 'bg-emerald-950 border-emerald-500 text-emerald-400' 
                : 'bg-gray-950 border-gray-800 text-gray-500'
            }`;
            node.innerText = `NIVEL ${i}`;
        }
        
        wrapper.appendChild(node);
        mapContainer.appendChild(wrapper);
        
        if (i < 5) {
            const line = document.createElement('div');
            line.className = `h-0.5 w-6 sm:w-10 transition-all duration-300 ${
                i < currentLevel ? 'bg-emerald-500' : 'bg-gray-800'
            }`;
            mapContainer.appendChild(line);
        }
    }
}

/**
 * ============================================================================
 *                    BUCLE PRINCIPAL Y RENDERING
 * ============================================================================
 */

/**
 * Bucle recursivo principal (RequestAnimationFrame) del motor de render.
 * Se encarga de procesar el screen shake, fondos, baldosas 3D, agentes, jefes, proyectiles y partículas.
 */
function renderLoop() {
    ctx.save();
    
    // Aplicar vibración de pantalla (efecto explosión/impacto)
    if (shakeDuration > 0) {
        const shakeX = (Math.random() - 0.5) * shakeIntensity;
        const shakeY = (Math.random() - 0.5) * shakeIntensity;
        ctx.translate(shakeX, shakeY);
        shakeDuration--;
    }

    const biome = BIOMES[currentBiomeIndex];
    drawProceduralBackground(ctx, currentBiomeIndex, canvas.width, canvas.height, Date.now());

    // Capa translúcida para contraste óptimo de baldosas y números
    ctx.fillStyle = biome.overlayColor || 'rgba(10, 15, 25, 0.40)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Borde decorativo
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

    // Dibujar Grilla de Baldosas 3D
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const tile = grid[c]?.[r];
            if (!tile) continue;

            const screenPos = gridToScreen(c, r);
            const isHovered = (mouseHoveredCell.col === c && mouseHoveredCell.row === r);
            const isVisible = isWithinVision(c, r);

            const isSunken = tile.visited || tile.exploded;
            let targetDepth = isSunken ? 0 : depthHeight;
            tile.animDepth += (targetDepth - tile.animDepth) * 0.15; // Suavizado de revelación (se hunde al descubrirse)
            const depth = tile.animDepth;

            let topColor = '#111827';
            let depthColor = '#030712';
            let borderHighlightColor = null;

            if (isVisible) {
                if (isSunken) {
                    topColor = '#070a13';
                    depthColor = '#010409';
                } else {
                    if (isHovered) {
                        topColor = '#10b981';
                        depthColor = '#047857'; 
                        borderHighlightColor = '#34d399';
                    } else {
                        topColor = '#059669';
                        depthColor = '#064e3b';
                        borderHighlightColor = '#10b981';
                    }
                }
            } else {
                if (isSunken) {
                    topColor = '#030712'; 
                    depthColor = '#000000';
                } else {
                    if (isHovered) {
                        topColor = '#334155';
                        depthColor = '#1e293b';
                        borderHighlightColor = '#475569';
                    } else {
                        topColor = '#1e293b';
                        depthColor = '#0f172a';
                        borderHighlightColor = '#334155';
                    }
                }
            }

            // Renderizado de las caras tridimensionales laterales
            ctx.save();
            ctx.globalAlpha = 0.75; 

            if (depth > 0) {
                ctx.fillStyle = depthColor;
                ctx.beginPath();
                ctx.rect(screenPos.x, screenPos.y - depth + topHeight, cellWidth, depth);
                ctx.fill();

                ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
                ctx.beginPath();
                ctx.rect(screenPos.x, screenPos.y - depth + topHeight + (depth * 0.4), cellWidth, depth * 0.6);
                ctx.fill();

                ctx.strokeStyle = '#020617';
                ctx.lineWidth = 1;
                ctx.strokeRect(screenPos.x, screenPos.y - depth + topHeight, cellWidth, depth);
            }

            // Renderizado de la cara superior de la baldosa (Con gradiente y brillos en hover)
            const tGrad = ctx.createLinearGradient(screenPos.x, screenPos.y - depth, screenPos.x + cellWidth, screenPos.y - depth + topHeight);
            tGrad.addColorStop(0, topColor);
            tGrad.addColorStop(1, depthColor);
            ctx.fillStyle = tGrad;
            
            if (isHovered && !isSunken) {
                ctx.shadowColor = borderHighlightColor;
                ctx.shadowBlur = 10;
            }

            
            ctx.beginPath();
            ctx.rect(screenPos.x, screenPos.y - depth, cellWidth, topHeight);
            ctx.fill();

            if (!isSunken) {
                // Bordes brillantes del relieve 3D
                ctx.strokeStyle = borderHighlightColor || 'rgba(255, 255, 255, 0.15)';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(screenPos.x, screenPos.y - depth + topHeight);
                ctx.lineTo(screenPos.x, screenPos.y - depth);
                ctx.lineTo(screenPos.x + cellWidth, screenPos.y - depth);
                ctx.stroke();

                ctx.strokeStyle = 'rgba(0, 0, 0, 0.65)';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(screenPos.x + cellWidth, screenPos.y - depth);
                ctx.lineTo(screenPos.x + cellWidth, screenPos.y - depth + topHeight);
                ctx.lineTo(screenPos.x, screenPos.y - depth + topHeight);
                ctx.stroke();
            } else {
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
                ctx.lineWidth = 1.5;
                ctx.strokeRect(screenPos.x, screenPos.y - depth, cellWidth, topHeight);
                
                ctx.strokeStyle = 'rgba(0, 0, 0, 0.7)';
                ctx.lineWidth = 1.2;
                ctx.strokeRect(screenPos.x + 1, screenPos.y + 1, cellWidth - 2, topHeight - 2);
            }
            ctx.restore();

            // Dibujar entidades e iconos conocidos sobre la baldosa
            if (tile.flagged && !isSunken) {
                drawFlagEntity(ctx, screenPos.x, screenPos.y - depth);
            } else {
                if (tile.exploded) {
                    drawExplodedMine(ctx, screenPos.x, screenPos.y);
                } else if (tile.isMine && isSunken) {
                    drawUnexplodedMine(ctx, screenPos.x, screenPos.y - depth);
                } else if (tile.isHeart && !tile.heartCollected && isSunken) {
                    drawHeartEntity(ctx, screenPos.x, screenPos.y - depth);
                } else if (tile.isCoin && !tile.coinCollected && isSunken) {
                    drawCoinEntity(ctx, screenPos.x, screenPos.y - depth);
                } else if (tile.isStone && isSunken) {
                    drawStoneEntity(ctx, screenPos.x, screenPos.y - depth);
                } else if (isSunken && isVisible) {
                    if (tile.neighborMines > 0) {
                        drawNumberIndicator(ctx, tile.neighborMines, screenPos.x, screenPos.y - depth);
                    }
                }
            }

            // Indicador de previsualización azul si se usa ítem de inventario activo
            if (isHovered && selectedActiveItem && !isSunken) {
                ctx.strokeStyle = '#38bdf8';
                ctx.lineWidth = 2;
                ctx.strokeRect(screenPos.x, screenPos.y - depth, cellWidth, topHeight);
            }
        }
    }

    // Procesar movimiento suave e interpolación lineal de la ranita
    if (frog.isSpawned) {
        if (frog.isMoving && frog.path.length > 0) {
            const currentTarget = frog.path[0];
            const targetPos = gridToScreen(currentTarget.col, currentTarget.row);
            
            const dx = targetPos.x - frog.animX;
            const dy = targetPos.y - frog.animY;

            frog.direction = dx >= 0 ? 'right' : 'left';

            if (Math.abs(dx) < 2 && Math.abs(dy) < 2) {
                frog.animX = targetPos.x;
                frog.animY = targetPos.y;
                
                frog.col = currentTarget.col;
                frog.row = currentTarget.row;
                frog.path.shift();

                sfx.playStep();
                onFrogSteppedOnCell(frog.col, frog.row);

                if (frog.path.length === 0) {
                    frog.isMoving = false;
                    frog.state = 'idle';
                }
            } else {
                frog.animX += dx * frog.speed;
                frog.animY += dy * frog.speed;
            }
        }

        drawFrogHero(ctx, frog.animX, frog.animY);
    }

    // Actualizar temporizador de nivel
    if (gameState === 'PLAYING' && levelStartTime > 0) {
        levelElapsedTime = Math.floor((Date.now() - levelStartTime) / 1000);
        const mins = Math.floor(levelElapsedTime / 60).toString().padStart(2, '0');
        const secs = (levelElapsedTime % 60).toString().padStart(2, '0');
        
        if (DOM.timerDisplay) {
            DOM.timerDisplay.innerText = `${mins}:${secs}`;
        }
    }

    // Sonidos ambientales periódicos de bioma (cada 6 segundos)
    if (gameState === 'PLAYING') {
        const now = Date.now();
        if (now - lastAmbientPlayTime > 6000) {
            lastAmbientPlayTime = now;
            sfx.playBiomeAmbient(currentBiomeIndex);
        }
    }

    // Lógica del combate contra el Jefe de Bioma
    if (bossActive && gameState === 'PLAYING' && bossHp > 0) {
        const now = Date.now();
        if (now - bossLastAttackTime > bossAttackInterval) {
            bossLastAttackTime = now;
            executeBossAttack();
        }

        // Dibujar al enemigo vectorial
        drawBossEntity(ctx, 720, 220, currentBiomeIndex, now);

        // Barra de Vida HUD del jefe
        ctx.save();
        const barW = 300;
        const barH = 12;
        const barX = (canvas.width - barW) / 2;
        const barY = 25;
        
        ctx.fillStyle = 'rgba(31, 41, 55, 0.8)';
        ctx.fillRect(barX, barY, barW, barH);
        
        const fillRatio = bossHp / bossMaxHp;
        const fillW = barW * fillRatio;
        const hpGrad = ctx.createLinearGradient(barX, barY, barX + fillW, barY);
        hpGrad.addColorStop(0, '#dc2626');
        hpGrad.addColorStop(1, '#f87171');
        ctx.fillStyle = hpGrad;
        ctx.fillRect(barX, barY, fillW, barH);
        
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(barX, barY, barW, barH);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${bossName.toUpperCase()} : ${bossHp}/${bossMaxHp}`, canvas.width / 2, barY - 8);
        
        // Línea indicadora de progreso del próximo ataque del jefe
        const timeSinceLast = now - bossLastAttackTime;
        const nextAttackProgress = Math.min(1, timeSinceLast / bossAttackInterval);
        ctx.fillStyle = 'rgba(239, 68, 68, 0.4)';
        ctx.fillRect(barX, barY + barH + 2, barW * (1 - nextAttackProgress), 2);
        ctx.restore();
    }

    // Actualizar y dibujar proyectiles en vuelo hacia el jefe
    for (let i = bossProjectiles.length - 1; i >= 0; i--) {
        const proj = bossProjectiles[i];
        proj.update();
        proj.draw(ctx);
        
        if (proj.progress >= 1) {
            bossHp--;
            if (bossHp < 0) bossHp = 0;
            
            sfx.playBossDamage();
            triggerScreenShake(20, 6);
            
            // Partículas de escombros de roca
            spawnParticles(proj.targetX, proj.targetY, '#64748b', 12, 'spark');
            
            bossProjectiles.splice(i, 1);
            
            // Validar derrota del jefe
            if (bossHp <= 0) {
                bossActive = false;
                spawnParticles(proj.targetX, proj.targetY, '#fbbf24', 45, 'spark');
                sfx.playWin();
                
                const mins = Math.floor(levelElapsedTime / 60).toString().padStart(2, '0');
                const secs = (levelElapsedTime % 60).toString().padStart(2, '0');
                completedLevelTimes[currentLevel - 1] = `${mins}:${secs}`;
                updateLevelMapUI();
                
                setTimeout(() => {
                    triggerWinLevel();
                }, 1000);
            }
        }
    }

    // Actualizar ciclo de vida y renderizado de partículas
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        particles[i].draw(ctx);
        if (particles[i].life <= 0) {
            particles.splice(i, 1);
        }
    }

    ctx.restore();
    requestAnimationFrame(renderLoop);
}

/**
 * Ejecuta el ataque especial del jefe cubriendo con humo y volviendo a ocultar baldosas reveladas.
 */
function executeBossAttack() {
    if (!bossActive || bossHp <= 0) return;
    
    sfx.playBossRoar();
    triggerScreenShake(40, 8);
    
    let candidates = [];
    for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
            const tile = grid[c][r];
            // Cubre baldosas ya exploradas que no contengan ítems críticos o la posición actual del jugador
            if (tile.visited && !tile.isMine && !tile.isStone && !tile.heartCollected && !tile.coinCollected) {
                if (c !== frog.col || r !== frog.row) {
                    candidates.push({ col: c, row: r });
                }
            }
        }
    }
    
    if (candidates.length === 0) return;
    
    // Barajar los candidatos al azar
    candidates.sort(() => Math.random() - 0.5);
    
    const countToCover = Math.min(candidates.length, 2 + currentBiomeIndex);
    for (let i = 0; i < countToCover; i++) {
        const pos = candidates[i];
        const tile = grid[pos.col][pos.row];
        tile.visited = false;
        tile.animDepth = depthHeight;
        
        // Emisión de partículas de humo oscuro
        const sPos = gridToScreen(pos.col, pos.row);
        for (let p = 0; p < 8; p++) {
            particles.push(new Particle(
                sPos.x + cellWidth / 2 + (Math.random() - 0.5) * 16,
                sPos.y + topHeight / 2 + (Math.random() - 0.5) * 16,
                '#111827',
                'spark'
            ));
        }
    }
    
    updateProgressUI();
}

/**
 * Procesa la interacción divertida (Squash/Stretch) al pulsar repetidamente sobre la ranita.
 * Al acumular 6 clics, se activa un atajo/truco para superar el nivel instantáneamente.
 */
function handleFrogSqueezed() {
    if (gameState !== 'PLAYING') return;
    
    frogSqueezeCount++;
    frogSqueezeScaleX = 1.4;
    frogSqueezeScaleY = 0.6;
    sfx.playFrogSqueeze();
    
    // Emitir chispas verdes cómicas alrededor de la ranita
    spawnParticles(
        frog.animX + cellWidth / 2,
        frog.animY + cellHeight / 2 - 8,
        '#34d399',
        8,
        'spark'
    );
    
    if (frogSqueezeCount >= 6) {
        frogSqueezeCount = 0;
        
        if (currentLevel === 5) {
            bossHp = 0;
        }
        
        // Emitir un gran estallido estelar de victoria
        spawnParticles(
            frog.animX + cellWidth / 2,
            frog.animY + cellHeight / 2 - 8,
            '#fbbf24',
            24,
            'spark'
        );
        
        triggerWinLevel();
    }
}

/**
 * ============================================================================
 *                    MECÁNICAS DEL EVENTO DE PASOS
 * ============================================================================
 */

/**
 * Procesa las consecuencias inmediatas de que la rana aterrice sobre una celda específica.
 * 
 * @param {number} col - Columna pisada.
 * @param {number} row - Fila pisada.
 */
function onFrogSteppedOnCell(col, row) {
    const tile = grid[col][row];
    tile.visited = true;

    updateProgressUI();

    // 1. Detección de mina activa
    if (tile.isMine && !tile.exploded) {
        const activeShield = shopInventory.find(i => i.id === 'shield');
        
        // Proteger automáticamente si tiene el Escudo de Faraday
        if (activeShield && activeShield.quantity > 0) {
            activeShield.quantity--;
            tile.exploded = true;
            triggerScreenShake(20, 8);
            spawnExplosionParticles(frog.animX + cellWidth / 2, frog.animY + cellHeight / 2);
            sfx.playExplosion();
            updateInventoryUI();
            
            frog.path = [];
            frog.isMoving = false;
            checkGameOverOrWin();
            return;
        }

        // Detonación letal
        tile.exploded = true;
        triggerScreenShake(30, 14);
        spawnExplosionParticles(frog.animX + cellWidth / 2, frog.animY + cellHeight / 2);
        sfx.playExplosion();

        if (extraHearts > 0) {
            extraHearts--;
        } else {
            lives--;
        }
        updateHeartsUI();

        frog.path = [];
        frog.isMoving = false;

        if (lives <= 0) {
            triggerGameOver();
            return;
        }
    }

    // 2. Recolección de Corazones de vida
    if (tile.isHeart && !tile.heartCollected) {
        tile.heartCollected = true;
        if (lives < 2) {
            lives = 2;
        } else {
            extraHearts++;
        }
        updateHeartsUI();
        sfx.playHeart();
        spawnHeartParticles(frog.animX + cellWidth / 2, frog.animY + cellHeight / 2);
    }

    // 3. Recolección de Monedas
    if (tile.isCoin && !tile.coinCollected) {
        tile.coinCollected = true;
        gold += 1;
        DOM.goldDisplay.innerText = gold;
        sfx.playCoin();
        spawnCoinParticles(frog.animX + cellWidth / 2, frog.animY + cellHeight / 2);
        updateShopUI();
    }

    // 4. Activación de piedras rúnicas contra el jefe
    if (tile.isStone && !tile.stoneActivated) {
        tile.stoneActivated = true;
        const sPos = gridToScreen(col, row);
        bossProjectiles.push(new StoneProjectile(sPos.x + cellWidth / 2, sPos.y + topHeight / 2 - tile.animDepth, 720, 220));
        sfx.playStoneThrow();
    }

    checkGameOverOrWin();
}

/**
 * Valida si el estado del juego debe transicionar a victoria o derrota.
 */
function checkGameOverOrWin() {
    if (gameState !== 'PLAYING') return;

    if (currentLevel === 5) {
        if (bossActive && bossHp <= 0) {
            bgm.setBossMode(false); // 🎵 Volver a música normal al derrotar al jefe
            triggerWinLevel();
        }
    } else {
        const progress = getGameProgress();
        if (progress.revealed === progress.total) {
            triggerWinLevel();
        }
    }
}

/**
 * Despliega el overlay de Game Over y permite reiniciar la partida.
 */
function triggerGameOver() {
    gameState = 'GAMEOVER';
    sfx.playLose();
    frog.state = 'dead';
    
    const overlay = DOM.gameOverlay;
    const content = DOM.overlayContent;
    overlay.classList.remove('hidden');
    
    content.innerHTML = `
        <div class="text-red-500 text-6xl mb-2 animate-bounce">💀</div>
        <h2 class="text-red-500 font-extrabold text-3xl pixel-font uppercase">Viaje Terminado</h2>
        <p class="text-sm text-gray-400 my-2">¡${frog.name} cayó ante una mina ancestral en el Templo!</p>
        <div class="flex gap-2 text-yellow-500 text-xs bg-gray-900 border border-gray-800 p-3 rounded-xl mt-2 w-full justify-center">
            <i class="ph ph-coins text-lg"></i> Oro Guardado: <span class="font-bold">${gold}</span>
        </div>
        <button onclick="restartGame()" class="mt-4 px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold transition duration-200 uppercase tracking-wider shadow-lg shadow-red-700/30 w-full">
            Volver a Intentar
        </button>
    `;
}

/**
 * Despliega el panel de Victoria de nivel, calcula recompensas de oro y graba tiempos récord.
 */
function triggerWinLevel() {
    gameState = 'WIN';
    sfx.playWin();
    
    // Grabar la marca de tiempo de superación del nivel
    if (levelStartTime > 0 && !completedLevelTimes[currentLevel - 1]) {
        const mins = Math.floor(levelElapsedTime / 60).toString().padStart(2, '0');
        const secs = (levelElapsedTime % 60).toString().padStart(2, '0');
        completedLevelTimes[currentLevel - 1] = `${mins}:${secs}`;
        updateLevelMapUI();
    }
    
    const reward = 4 + currentLevel * 2;
    gold += reward;
    DOM.goldDisplay.innerText = gold;

    const overlay = DOM.gameOverlay;
    const content = DOM.overlayContent;
    overlay.classList.remove('hidden');

    const isBossWin = (currentLevel === 5);

    content.innerHTML = `
        <div class="text-yellow-400 text-5xl mb-2 animate-pulse">⭐ 👑 ⭐</div>
        <h2 class="text-yellow-400 font-extrabold text-2xl pixel-font uppercase">
            ${isBossWin ? '¡BIOMA DESPEJADO!' : '¡TEMPLO DESPEJADO!'}
        </h2>
        <p class="text-xs text-gray-400 my-2">
            ${isBossWin ? '¡Derrotaste al Jefe Supremo de esta región!' : '¡Desvelaste cada secreto sin dejar una sola mina!'}
        </p>
        <div class="flex flex-col gap-1 w-full text-xs text-gray-400 bg-gray-900 border border-gray-800 p-3 rounded-xl my-2 text-left">
            <div class="flex justify-between"><span>Oro de Conquista:</span> <span class="text-yellow-400 font-bold">+${reward}</span></div>
            <div class="flex justify-between border-t border-gray-800 pt-1 mt-1"><span>Oro Total:</span> <span class="text-yellow-400 font-bold">${gold}</span></div>
        </div>
        <button onclick="advanceNextLevel()" class="mt-4 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl font-bold transition duration-200 uppercase tracking-wider shadow-lg shadow-emerald-500/30 w-full">
            ${isBossWin ? 'Viajar al Siguiente Bioma' : `Avanzar al Nivel ${currentLevel + 1}`}
        </button>
    `;
}

/**
 * Carga el siguiente nivel de dificultad o avanza de Bioma en caso de batir al jefe (nivel 5).
 * Se expone en 'window' para llamadas directas desde botones HTML.
 */
window.advanceNextLevel = function() {
    if (currentLevel === 5) {
        currentBiomeIndex = (currentBiomeIndex + 1) % BIOMES.length;
        currentLevel = 1;
        completedLevelTimes = [null, null, null, null, null];
        bgm.setBiome(currentBiomeIndex);
    } else {
        currentLevel++;
    }
    
    if (currentLevel === 5) {
        totalMines = 18; // Dificultad fija de minas para Jefes
    } else {
        totalMines = 11 + currentLevel;
    }

    // Reiniciar estado y variables de la ranita
    frog.isSpawned = false;
    frog.col = -1;
    frog.row = -1;
    frog.path = [];
    frog.isMoving = false;
    frog.state = 'idle';

    // Reiniciar temporizador del nivel
    levelStartTime = 0;
    levelElapsedTime = 0;
    if (DOM.timerDisplay) DOM.timerDisplay.innerText = "00:00";

    initGrid();
    gameState = 'START';

    DOM.gameOverlay.classList.add('hidden');
    DOM.frogStatusText.innerText = "Clic donde quieras aparecer";
    
    updateProgressUI();
    updateShopUI();
    updateLevelMapUI();
};

/**
 * Reinicia la totalidad del progreso, vidas, oro e inventario para volver al inicio del juego.
 * Se expone en el objeto global 'window'.
 */
window.restartGame = function() {
    currentBiomeIndex = 0;
    currentLevel = 1;
    gold = 0;
    lives = 2;
    extraHearts = 0;
    totalMines = 12;
    completedLevelTimes = [null, null, null, null, null];
    bgm.setBiome(0);
    DOM.goldDisplay.innerText = gold;

    shopInventory.forEach(item => item.quantity = 0);
    selectedActiveItem = null;

    frog.isSpawned = false;
    frog.col = -1;
    frog.row = -1;
    frog.path = [];
    frog.isMoving = false;
    frog.state = 'idle';

    levelStartTime = 0;
    levelElapsedTime = 0;
    if (DOM.timerDisplay) DOM.timerDisplay.innerText = "00:00";

    initGrid();
    gameState = 'START';

    DOM.gameOverlay.classList.add('hidden');
    DOM.frogStatusText.innerText = "Clic donde quieras aparecer";
    
    updateHeartsUI();
    updateInventoryUI();
    updateShopUI();
    updateProgressUI();
    updateLevelMapUI();
};

/**
 * ============================================================================
 *                    LÓGICA E INTERFACES DE TIENDA E INVENTARIO
 * ============================================================================
 */

/**
 * Actualiza la visualización de los contenedores de corazones (vidas y corazones extra).
 */
function updateHeartsUI() {
    const container = DOM.heartsContainer;
    container.innerHTML = '';

    for (let i = 1; i <= 2; i++) {
        if (i <= lives) {
            container.innerHTML += `<span class="text-red-500 filter drop-shadow-[0_2px_4px_rgba(239,68,68,0.4)] animate-pulse">❤️</span>`;
        } else {
            container.innerHTML += `<span class="text-gray-700 opacity-60">🤍</span>`;
        }
    }

    if (extraHearts > 0) {
        container.innerHTML += `
            <span class="text-xs font-bold text-emerald-400 flex items-center gap-1 ml-2 bg-emerald-950 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                + (❤️ ${extraHearts})
            </span>
        `;
    }
}

/**
 * Actualiza el panel de inventario del usuario reflejando los ítems activos y equipados.
 */
function updateInventoryUI() {
    const gridContainer = DOM.inventoryGrid;
    gridContainer.innerHTML = '';

    for (let i = 0; i < 3; i++) {
        const item = shopInventory[i];
        const isSelected = selectedActiveItem && selectedActiveItem.id === item.id;
        
        if (item && item.quantity > 0) {
            gridContainer.innerHTML += `
                <button onclick="selectInventoryItem('${item.id}')" class="group relative aspect-square bg-gray-950 hover:bg-gray-800 rounded-xl border ${isSelected ? 'border-sky-400 shadow-lg shadow-sky-500/20' : 'border-gray-800 hover:border-gray-700'} flex flex-col items-center justify-center p-1 transition cursor-pointer">
                    <span class="text-2xl">${item.icon}</span>
                    <span class="text-[9px] text-gray-400 group-hover:text-white mt-1">x${item.quantity}</span>
                    <span class="pointer-events-none absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-950 text-[10px] text-gray-300 px-2.5 py-1 rounded-md border border-gray-800 w-28 text-center opacity-0 group-hover:opacity-100 transition duration-150 shadow-xl z-20">
                        ${item.name}
                    </span>
                </button>
            `;
        } else {
            gridContainer.innerHTML += `
                <div class="aspect-square bg-gray-950/40 rounded-xl border border-dashed border-gray-800/80 flex items-center justify-center text-xs text-gray-600">
                    Vacío
                </div>
            `;
        }
    }
}

/**
 * Actualiza visualmente el catálogo de la tienda y habilita/deshabilita la compra según presupuesto.
 */
function updateShopUI() {
    const shopContainer = DOM.shopItems;
    shopContainer.innerHTML = '';

    shopInventory.forEach(item => {
        const canAfford = gold >= item.cost;
        shopContainer.innerHTML += `
            <div class="bg-gray-950/80 p-3 rounded-xl border border-gray-800 flex justify-between items-center gap-2 group hover:border-gray-700/80 transition">
                <div class="flex gap-2.5 items-center">
                    <span class="text-2xl bg-gray-900 p-1.5 rounded-lg border border-gray-800 group-hover:scale-105 transition duration-200">${item.icon}</span>
                    <div class="text-left">
                        <h4 class="text-xs font-bold text-gray-200 group-hover:text-emerald-400 transition">${item.name}</h4>
                        <p class="text-[10px] text-gray-400 mt-0.5 max-w-[150px] leading-tight">${item.desc}</p>
                    </div>
                </div>
                <button onclick="buyShopItem('${item.id}')" ${!canAfford ? 'disabled' : ''} class="px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 ${canAfford ? 'bg-yellow-500 text-black hover:bg-yellow-400 cursor-pointer' : 'bg-gray-800/50 text-gray-500 cursor-not-allowed'} transition">
                    <i class="ph ph-coins"></i> ${item.cost}
                </button>
            </div>
        `;
    });
}

/**
 * Realiza la compra de un ítem si se cuenta con el oro suficiente.
 * Expuesta en el contexto global 'window'.
 * 
 * @param {string} itemId - ID del ítem comprado.
 */
window.buyShopItem = function(itemId) {
    const item = shopInventory.find(i => i.id === itemId);
    if (!item || gold < item.cost) return;

    gold -= item.cost;
    item.quantity++;

    DOM.goldDisplay.innerText = gold;
    sfx.playCoin();
    updateShopUI();
    updateInventoryUI();
};

/**
 * Selecciona un ítem activo del inventario para su uso posterior en el tablero.
 * Expuesta en el contexto global 'window'.
 * 
 * @param {string} itemId - ID del ítem seleccionado.
 */
window.selectInventoryItem = function(itemId) {
    const item = shopInventory.find(i => i.id === itemId);
    if (!item || item.quantity <= 0) return;

    // Escudos son pasivos, se auto-consumen
    if (item.type === 'shield') return;

    if (selectedActiveItem && selectedActiveItem.id === itemId) {
        selectedActiveItem = null;
    } else {
        selectedActiveItem = item;
        sfx.playStep();
    }
    updateInventoryUI();
};

/**
 * Ejecuta la revelación segura en un radio de 3x3 al consumir el Escáner de Pulso.
 * 
 * @param {number} c - Columna centro.
 * @param {number} r - Fila centro.
 */
function useScannerItem(c, r) {
    if (!selectedActiveItem || selectedActiveItem.id !== 'scanner') return;

    selectedActiveItem.quantity--;
    selectedActiveItem = null;

    sfx.playScan();
    triggerScreenShake(8, 3);

    for (let dc = -1; dc <= 1; dc++) {
        for (let dr = -1; dr <= 1; dr++) {
            const nc = c + dc;
            const nr = r + dr;
            if (nc >= 0 && nc < cols && nr >= 0 && nr < rows) {
                grid[nc][nr].visited = true;
                grid[nc][nr].flagged = false;
                
                // Procesar recolección segura inmediata
                if (grid[nc][nr].isCoin && !grid[nc][nr].coinCollected) {
                    grid[nc][nr].coinCollected = true;
                    gold += 1;
                    DOM.goldDisplay.innerText = gold;
                }
                if (grid[nc][nr].isHeart && !grid[nc][nr].heartCollected) {
                    grid[nc][nr].heartCollected = true;
                    if (lives < 2) lives = 2; else extraHearts++;
                    updateHeartsUI();
                }
                if (grid[nc][nr].isStone && !grid[nc][nr].stoneActivated) {
                    grid[nc][nr].stoneActivated = true;
                    const sPos = gridToScreen(nc, nr);
                    bossProjectiles.push(new StoneProjectile(sPos.x + cellWidth / 2, sPos.y + topHeight / 2 - grid[nc][nr].animDepth, 720, 220));
                    sfx.playStoneThrow();
                }
            }
        }
    }

    updateInventoryUI();
    updateShopUI();
    updateProgressUI();
    checkGameOverOrWin();
}

/**
 * Ejecuta el teletransporte inmediato de la rana usando el Ancla de Salto.
 * 
 * @param {number} c - Columna destino.
 * @param {number} r - Fila destino.
 */
function useJumpItem(c, r) {
    if (!selectedActiveItem || selectedActiveItem.id !== 'jump') return;

    const distance = Math.max(Math.abs(frog.col - c), Math.abs(frog.row - r));
    if (distance > 2 || grid[c][r].flagged) return;

    selectedActiveItem.quantity--;
    selectedActiveItem = null;

    sfx.playScan();
    spawnCoinParticles(frog.animX + cellWidth / 2, frog.animY + cellHeight / 2);

    frog.col = c;
    frog.row = r;
    const targetScreenPos = gridToScreen(c, r);
    frog.animX = targetScreenPos.x;
    frog.animY = targetScreenPos.y;
    frog.path = [];
    frog.isMoving = false;

    onFrogSteppedOnCell(c, r);

    updateInventoryUI();
    updateShopUI();
}

/**
 * Cambia el estado visual de la herramienta activa (Explorar / Bandera).
 * 
 * @param {string} tool - Nombre de la herramienta ('explore' o 'flag').
 */
function setTool(tool) {
    activeTool = tool;
    const btnExplore = DOM.toolExplore;
    const btnFlag = DOM.toolFlag;

    if (tool === 'explore') {
        btnExplore.className = "py-2 px-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-2 transition duration-150 bg-emerald-500 border-emerald-400 text-black shadow-lg shadow-emerald-500/10";
        btnFlag.className = "py-2 px-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-2 transition duration-150 bg-gray-900 border-gray-800 text-gray-400 hover:bg-gray-850";
    } else {
        btnFlag.className = "py-2 px-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-2 transition duration-150 bg-red-500 border-red-400 text-black shadow-lg shadow-red-500/10";
        btnExplore.className = "py-2 px-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-2 transition duration-150 bg-gray-900 border-gray-800 text-gray-400 hover:bg-gray-850";
    }
}

/**
 * Activa o desactiva de forma segura una bandera en una baldosa.
 * 
 * @param {number} col - Columna.
 * @param {number} row - Fila.
 */
function toggleFlag(col, row) {
    const tile = grid[col][row];
    if (!tile.visited) {
        tile.flagged = !tile.flagged;
        sfx.playStep();
    }
}

/**
 * ============================================================================
 *                    INICIALIZADOR GLOBAL Y MANEJADORES DE EVENTO
 * ============================================================================
 */

/**
 * Inicializador único global del juego. Se ejecuta al completarse la carga de la página
 * o del DOM, previniendo referencias nulas de elementos.
 */
function startEverything() {
    // Inicializar caché de elementos del DOM
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
    DOM.musicMuteBtn = document.getElementById('music-mute-btn');
    DOM.musicMuteIcon = document.getElementById('music-mute-icon');
    DOM.musicVolume = document.getElementById('music-volume');
    DOM.musicVolumeText = document.getElementById('music-volume-text');
    DOM.sfxMuteBtn = document.getElementById('sfx-mute-btn');
    DOM.sfxMuteIcon = document.getElementById('sfx-mute-icon');
    DOM.sfxVolume = document.getElementById('sfx-volume');
    DOM.sfxVolumeText = document.getElementById('sfx-volume-text');
    DOM.caminitoContainer = document.getElementById('caminito-container');
    DOM.frogNameDisplay = document.getElementById('frog-name-display');
    DOM.frogNameInput = document.getElementById('frog-name-input');
    DOM.nameModal = document.getElementById('name-modal');
    DOM.toolExplore = document.getElementById('tool-explore');
    DOM.toolFlag = document.getElementById('tool-flag');

    // Registrar manejadores de eventos en elementos HTML
    DOM.toolExplore.addEventListener('click', () => setTool('explore'));
    DOM.toolFlag.addEventListener('click', () => setTool('flag'));
    
    // Registrar manejadores de eventos de audio
    DOM.musicMuteBtn.addEventListener('click', () => {
        bgm.setMuted(!bgm.muted);
        updateAudioUI();
    });
    DOM.musicVolume.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        bgm.setVolume(val / 100);
        DOM.musicVolumeText.innerText = `${val}%`;
    });
    DOM.sfxMuteBtn.addEventListener('click', () => {
        sfx.setMuted(!sfx.muted);
        updateAudioUI();
    });
    DOM.sfxVolume.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        sfx.setVolume(val / 100);
        DOM.sfxVolumeText.innerText = `${val}%`;
    });

    // Control global del teclado (Espacio para herramientas, Alt+C para truco de nivel)
    window.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            e.preventDefault();
            setTool(activeTool === 'explore' ? 'flag' : 'explore');
        }
        if (e.code === 'KeyC' && e.altKey) {
            e.preventDefault();
            if (gameState === 'START' || gameState === 'PLAYING') {
                if (gameState === 'START') {
                    gameState = 'PLAYING';
                    levelStartTime = Date.now();
                    generateBoard(0, 0);
                    frog.isSpawned = true;
                    frog.col = 0;
                    frog.row = 0;
                    const pos = gridToScreen(0, 0);
                    frog.animX = pos.x;
                    frog.animY = pos.y;
                    onFrogSteppedOnCell(0, 0);
                }
                if (currentLevel === 5) {
                    bossHp = 0;
                }
                triggerWinLevel();
            }
        }
    });

    // Evento Mouse Move para arrastre visual y Parallax 3D
    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const mouseX = (e.clientX - rect.left) * scaleX;
        const mouseY = (e.clientY - rect.top) * scaleY;

        lastMouseX = mouseX;
        lastMouseY = mouseY;

        const hovered = screenToGrid(mouseX, mouseY);
        if (hovered) {
            mouseHoveredCell = hovered;
        } else {
            mouseHoveredCell = { col: -1, row: -1 };
        }
    });

    // Clic secundario para posicionar banderas rápidas
    canvas.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const mouseX = (e.clientX - rect.left) * scaleX;
        const mouseY = (e.clientY - rect.top) * scaleY;

        const clicked = screenToGrid(mouseX, mouseY);
        if (!clicked || gameState !== 'PLAYING') return;

        toggleFlag(clicked.col, clicked.row);
    });

    // Manejador central del Clic en el canvas
    canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const mouseX = (e.clientX - rect.left) * scaleX;
        const mouseY = (e.clientY - rect.top) * scaleY;

        // Detectar clic directo de compresión del truco (Squash) sobre la rana
        if (frog.isSpawned && gameState === 'PLAYING') {
            const frogCenterX = frog.animX + cellWidth / 2;
            const frogCenterY = frog.animY + cellHeight / 2 - 8;
            const dist = Math.hypot(mouseX - frogCenterX, mouseY - frogCenterY);
            if (dist < 22) {
                handleFrogSqueezed();
                return;
            }
        }

        const clicked = screenToGrid(mouseX, mouseY);
        if (!clicked) return;

        // 1. Ejecutar consumible activo si existe
        if (selectedActiveItem) {
            if (selectedActiveItem.id === 'scanner') {
                useScannerItem(clicked.col, clicked.row);
                return;
            }
            if (selectedActiveItem.id === 'jump') {
                useJumpItem(clicked.col, clicked.row);
                return;
            }
        }

        // 2. Colocar bandera si el modo bandera está activo
        if (activeTool === 'flag' && gameState === 'PLAYING') {
            toggleFlag(clicked.col, clicked.row);
            return;
        }

        if (grid[clicked.col][clicked.row].flagged) return;

        // 3. Procesar primer clic seguro de inicio de nivel
        if (gameState === 'START') {
            gameState = 'PLAYING';
            levelStartTime = Date.now();
            generateBoard(clicked.col, clicked.row);

            frog.isSpawned = true;
            frog.col = clicked.col;
            frog.row = clicked.row;
            const pos = gridToScreen(clicked.col, clicked.row);
            frog.animX = pos.x;
            frog.animY = pos.y;
            frog.isMoving = false;

            DOM.frogStatusText.innerText = "Viajando por el templo...";

            onFrogSteppedOnCell(clicked.col, clicked.row);
            return;
        }

        // 4. Mover a la rana con pathfinding clásico
        if (gameState === 'PLAYING' && !frog.isMoving) {
            const path = calculatePath(frog.col, frog.row, clicked.col, clicked.row);
            if (path.length > 0) {
                frog.path = path;
                frog.isMoving = true;
                frog.state = 'moving';
            }
        }
    });

    initGrid();
    updateHeartsUI();
    updateInventoryUI();
    updateShopUI();
    updateProgressUI();
    updateLevelMapUI();
    updateAudioUI();
    
    renderLoop();
}

/**
 * Actualiza la interfaz visual de los controles de audio (botones de silencio y deslizadores).
 */
function updateAudioUI() {
    if (bgm.muted) {
        DOM.musicMuteIcon.className = "ph ph-speaker-slash text-sm text-red-500 animate-pulse";
    } else {
        DOM.musicMuteIcon.className = "ph ph-speaker-high text-sm";
    }
    DOM.musicVolume.value = Math.round(bgm.volume * 100);
    DOM.musicVolumeText.innerText = `${Math.round(bgm.volume * 100)}%`;

    if (sfx.muted) {
        DOM.sfxMuteIcon.className = "ph ph-speaker-slash text-sm text-red-500 animate-pulse";
    } else {
        DOM.sfxMuteIcon.className = "ph ph-speaker-high text-sm";
    }
    DOM.sfxVolume.value = Math.round(sfx.volume * 100);
    DOM.sfxVolumeText.innerText = `${Math.round(sfx.volume * 100)}%`;
}

// Cargar el script de forma segura dependiendo del estado de lectura del documento
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    startEverything();
} else {
    window.onload = startEverything;
}