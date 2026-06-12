/**
 * Módulo que exporta el sintetizador de audio retro de 8 bits basado en Web Audio API.
 * @module synth
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
export { sfx };
