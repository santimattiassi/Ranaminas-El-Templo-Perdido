/**
 * ============================================================================
 *               SECUENCIADOR DE MÚSICA PROCEDURAL 16-BITS
 * ============================================================================
 */

/**
 * Plantillas de Melodías y Percusión por cada uno de los 6 Biomas.
 * 128 pasos (8 compases × 16 semicorcheas) para loops de ~20 segundos.
 * @const
 */
const BIOME_PATTERNS = [
    // ─── Bioma 0: Pantano (90 BPM) ───────────────────────────────────────────
    // Clave de Do menor – Misterioso, pantanoso, ecos profundos
    {
        steps: 128,
        bass: [
            // Comp 1-2: Tema principal
            65.41, 0, 65.41, 0, 98.00, 0, 98.00, 0, 116.54, 0, 116.54, 0, 65.41, 0, 65.41, 0,
            65.41, 0, 65.41, 0, 87.31, 0, 87.31, 0, 103.83, 0, 103.83, 0, 65.41, 0, 65.41, 0,
            // Comp 3-4: Variación oscura
            98.00, 0, 98.00, 0, 116.54, 0, 116.54, 0, 87.31, 0, 87.31, 0, 98.00, 0, 98.00, 0,
            65.41, 0, 65.41, 0, 65.41, 0, 65.41, 0, 103.83, 0, 103.83, 0, 116.54, 0, 0,    0,
            // Comp 5-6: Puente – movimiento armónico
            65.41, 0, 65.41, 0, 98.00, 0, 98.00, 0, 116.54, 0, 116.54, 0, 65.41, 0, 65.41, 0,
            103.83, 0, 103.83, 0, 103.83, 0, 87.31, 0, 87.31, 0, 87.31, 0, 98.00, 0, 98.00, 0,
            // Comp 7-8: Regreso y cierre
            65.41, 0, 65.41, 0, 65.41, 0, 98.00, 0, 116.54, 0, 98.00, 0, 87.31, 0, 65.41, 0,
            65.41, 0, 0,    0, 65.41, 0, 65.41, 0, 65.41, 0, 98.00, 0, 116.54, 0, 0,    0
        ],
        lead: [
            130.81, 0, 155.56, 0, 174.61, 196.00, 0, 155.56, 174.61, 0, 130.81, 0, 0,    0,    0,    0,
            207.65, 0, 196.00, 0, 174.61, 0, 155.56, 0, 130.81, 0, 155.56, 0, 174.61, 0, 0,    0,
            196.00, 207.65, 0, 233.08, 0, 207.65, 196.00, 0, 174.61, 0, 155.56, 0, 130.81, 155.56, 0, 0,
            174.61, 0, 174.61, 0, 174.61, 0, 155.56, 0, 130.81, 0, 0, 155.56, 174.61, 0, 196.00, 0,
            130.81, 0, 155.56, 0, 174.61, 196.00, 0, 155.56, 207.65, 0, 196.00, 0, 174.61, 0, 0, 0,
            207.65, 0, 233.08, 0, 207.65, 0, 196.00, 0, 174.61, 207.65, 0, 196.00, 174.61, 0, 155.56, 0,
            130.81, 0, 0,    0, 155.56, 0, 174.61, 196.00, 207.65, 0, 0, 0, 196.00, 174.61, 155.56, 130.81,
            130.81, 0, 155.56, 0, 0,    0, 174.61, 0, 196.00, 0, 0, 0, 130.81, 0, 0,    0
        ],
        perc: [
            'K','H','S','H','K','H','S','H','K','H','S','H','K','H','S','K',
            'K','H','S','H','K','H','S','H','K','H','S','H','K','H','S','H',
            'K','H','S','H','K','H','S','H','K','H','S','H','K','H','S','K',
            'K','H','S','H','K','H','S','K','K','H','S','H','K','H','S','H',
            'K','H','S','H','K','H','S','H','K','H','S','H','K','H','S','K',
            'K','H','H','S','K','H','S','H','K','K','S','H','K','H','S','H',
            'K','H','S','K','K','H','S','H','K','H','S','H','K','K','S','H',
            'K','H','S','H','K','H','S','H','K','H','H','H','S','H','H','H'
        ]
    },

    // ─── Bioma 1: Bosque (105 BPM) ────────────────────────────────────────────
    // La menor – Místico, celta, viento entre árboles
    {
        steps: 128,
        bass: [
            // Comp 1-2: Tema celta principal
            110.00, 0, 110.00, 110.00, 164.81, 0, 164.81, 0, 98.00, 0, 98.00, 98.00, 146.83, 0, 146.83, 0,
            110.00, 0, 110.00, 0, 146.83, 0, 146.83, 146.83, 110.00, 0, 98.00, 0, 98.00, 0, 110.00, 0,
            // Comp 3-4: Subida melódica
            130.81, 0, 130.81, 0, 146.83, 0, 164.81, 0, 146.83, 0, 130.81, 0, 110.00, 0, 98.00, 0,
            110.00, 110.00, 0, 98.00, 0, 98.00, 0, 87.31, 87.31, 0, 98.00, 0, 110.00, 0, 0,    0,
            // Comp 5-6: Puente oscuro
            98.00, 0, 98.00, 0, 110.00, 0, 110.00, 0, 130.81, 0, 130.81, 0, 110.00, 0, 98.00, 0,
            87.31, 0, 87.31, 0, 98.00, 0, 98.00, 0, 110.00, 0, 110.00, 0, 130.81, 0, 130.81, 0,
            // Comp 7-8: Coda regreso
            110.00, 0, 110.00, 110.00, 164.81, 0, 164.81, 0, 110.00, 0, 146.83, 0, 130.81, 0, 0,    0,
            110.00, 0, 0,    0, 110.00, 0, 110.00, 0, 110.00, 146.83, 0, 164.81, 146.83, 0, 110.00, 0
        ],
        lead: [
            220.00, 246.94, 261.63, 0, 293.66, 0, 329.63, 0, 261.63, 0, 220.00, 0, 246.94, 0, 196.00, 0,
            220.00, 0, 246.94, 261.63, 0, 293.66, 261.63, 0, 246.94, 220.00, 0, 246.94, 261.63, 0, 0, 0,
            329.63, 0, 293.66, 0, 261.63, 0, 246.94, 0, 261.63, 293.66, 0, 329.63, 0, 293.66, 261.63, 0,
            246.94, 0, 220.00, 0, 246.94, 0, 261.63, 0, 246.94, 0, 220.00, 0, 196.00, 246.94, 220.00, 0,
            261.63, 0, 293.66, 0, 329.63, 0, 349.23, 329.63, 0, 293.66, 0, 261.63, 0, 246.94, 220.00, 0,
            220.00, 246.94, 0, 261.63, 0, 293.66, 0, 261.63, 0, 246.94, 0, 220.00, 0, 196.00, 0, 0,
            220.00, 246.94, 261.63, 0, 293.66, 0, 329.63, 0, 293.66, 261.63, 0, 246.94, 220.00, 0, 0, 0,
            220.00, 0, 0, 0, 246.94, 0, 261.63, 0, 0, 0, 293.66, 0, 220.00, 0, 0, 0
        ],
        perc: [
            'K','H','H','H','S','H','K','H','K','H','H','H','S','K','H','H',
            'K','H','H','H','S','H','K','H','K','H','H','H','S','K','H','H',
            'K','H','S','H','K','H','S','H','K','K','H','H','S','H','K','H',
            'K','H','S','H','K','K','H','H','S','H','K','H','H','H','S','H',
            'K','H','H','H','S','H','K','H','K','H','H','H','S','K','H','H',
            'K','H','S','H','K','H','S','H','K','K','H','H','S','H','K','H',
            'K','H','H','H','S','H','K','H','K','H','H','H','S','K','H','H',
            'K','H','H','H','S','H','H','H','K','H','H','H','H','H','S','H'
        ]
    },

    // ─── Bioma 2: Desierto (100 BPM) ─────────────────────────────────────────
    // Mi Frigio Dominante – Exótico, arenoso, oriental
    {
        steps: 128,
        bass: [
            // Comp 1-2: Frigio dominante E
            82.41, 0, 82.41, 0, 87.31, 0, 87.31, 0, 103.83, 0, 103.83, 0, 82.41, 0, 82.41, 0,
            82.41, 0, 82.41, 0, 110.00, 0, 110.00, 0, 92.50, 0, 87.31, 0, 82.41, 0, 0,    0,
            // Comp 3-4: Movimiento cromático ascendente
            110.00, 0, 110.00, 0, 103.83, 0, 98.00, 0, 92.50, 0, 87.31, 0, 82.41, 0, 77.78, 0,
            82.41, 0, 87.31, 0, 92.50, 0, 98.00, 0, 103.83, 0, 110.00, 0, 103.83, 0, 92.50, 0,
            // Comp 5-6: Variación grave
            82.41, 82.41, 0, 82.41, 87.31, 0, 87.31, 0, 103.83, 0, 103.83, 103.83, 87.31, 0, 82.41, 0,
            82.41, 0, 87.31, 0, 92.50, 87.31, 0, 82.41, 0, 82.41, 0, 110.00, 0, 103.83, 92.50, 0,
            // Comp 7-8: Coda del desierto
            82.41, 0, 0,    0, 87.31, 0, 0,    0, 103.83, 0, 0,    0, 92.50, 87.31, 82.41, 0,
            82.41, 82.41, 0, 82.41, 82.41, 0, 87.31, 0, 103.83, 0, 87.31, 0, 82.41, 0, 0, 0
        ],
        lead: [
            164.81, 174.61, 207.65, 0, 220.00, 0, 246.94, 220.00, 207.65, 0, 174.61, 0, 164.81, 0, 0, 0,
            164.81, 0, 174.61, 0, 207.65, 0, 220.00, 207.65, 0, 185.00, 174.61, 164.81, 0, 174.61, 207.65, 0,
            220.00, 0, 220.00, 0, 246.94, 0, 246.94, 220.00, 207.65, 174.61, 0, 164.81, 0, 174.61, 164.81, 0,
            164.81, 174.61, 185.00, 0, 207.65, 0, 220.00, 0, 246.94, 0, 293.66, 0, 246.94, 220.00, 207.65, 0,
            164.81, 0, 174.61, 0, 207.65, 0, 220.00, 0, 246.94, 0, 220.00, 207.65, 185.00, 174.61, 164.81, 0,
            185.00, 174.61, 0, 164.81, 0, 174.61, 0, 185.00, 207.65, 0, 220.00, 207.65, 185.00, 0, 174.61, 0,
            164.81, 0, 0,    0, 174.61, 0, 207.65, 0, 220.00, 246.94, 0, 220.00, 207.65, 174.61, 0, 164.81,
            164.81, 0, 174.61, 0, 0,    0, 207.65, 0, 164.81, 0, 0,    0, 164.81, 0,    0,    0
        ],
        perc: [
            'K','H','S','H','H','K','S','H','K','H','S','H','H','K','S','H',
            'K','H','S','H','H','K','S','H','K','H','S','H','H','K','S','H',
            'K','H','S','H','K','K','S','H','K','H','S','H','K','K','S','H',
            'K','H','S','H','K','H','S','H','K','H','S','K','K','H','S','H',
            'K','H','S','H','H','K','S','H','K','H','S','H','H','K','S','H',
            'K','H','H','S','K','H','S','H','K','K','S','H','K','H','H','S',
            'K','H','S','H','K','H','S','H','K','H','S','H','K','K','S','H',
            'K','H','H','H','S','H','H','H','K','H','H','H','S','H','H','H'
        ]
    },

    // ─── Bioma 3: Ciudad (125 BPM) ────────────────────────────────────────────
    // Re menor – Synthwave enérgico, neón, drop electrónico
    {
        steps: 128,
        bass: [
            // Comp 1-2: Drive de octavas D
            73.42, 146.83, 73.42, 146.83, 65.41, 130.81, 65.41, 130.81, 73.42, 146.83, 73.42, 146.83, 77.78, 155.56, 77.78, 155.56,
            73.42, 146.83, 73.42, 73.42, 65.41, 130.81, 65.41, 65.41, 73.42, 73.42, 146.83, 0, 77.78, 155.56, 0, 0,
            // Comp 3-4: Cambio a Sol-Do
            98.00, 196.00, 98.00, 196.00, 130.81, 261.63, 130.81, 261.63, 98.00, 196.00, 98.00, 196.00, 110.00, 220.00, 110.00, 220.00,
            98.00, 196.00, 98.00, 0, 130.81, 261.63, 0, 0, 98.00, 0, 110.00, 0, 130.81, 0, 146.83, 0,
            // Comp 5-6: Drop / breakdown minimalista
            73.42, 0, 0, 0, 73.42, 0, 0, 0, 73.42, 0, 0, 146.83, 0, 0, 77.78, 0,
            65.41, 0, 0, 0, 65.41, 0, 0, 0, 73.42, 0, 73.42, 0, 77.78, 0, 0,    0,
            // Comp 7-8: Build up y retorno
            73.42, 146.83, 73.42, 146.83, 65.41, 130.81, 65.41, 130.81, 73.42, 146.83, 73.42, 146.83, 77.78, 155.56, 77.78, 0,
            73.42, 73.42, 146.83, 73.42, 146.83, 65.41, 65.41, 130.81, 73.42, 73.42, 73.42, 146.83, 77.78, 77.78, 155.56, 0
        ],
        lead: [
            293.66, 0, 293.66, 0, 349.23, 0, 392.00, 0, 293.66, 0, 293.66, 0, 349.23, 392.00, 440.00, 0,
            440.00, 0, 440.00, 392.00, 349.23, 0, 349.23, 0, 392.00, 0, 440.00, 0, 466.16, 440.00, 392.00, 0,
            392.00, 0, 440.00, 0, 466.16, 0, 523.25, 0, 466.16, 0, 440.00, 0, 392.00, 0, 349.23, 0,
            349.23, 0, 392.00, 0, 440.00, 0, 392.00, 349.23, 0, 329.63, 0, 293.66, 0, 329.63, 349.23, 0,
            293.66, 0, 0, 0, 349.23, 0, 0, 0, 392.00, 0, 0, 0, 440.00, 0, 0, 0,
            466.16, 0, 0, 0, 440.00, 0, 0, 0, 392.00, 0, 0, 0, 349.23, 0, 0, 0,
            293.66, 0, 293.66, 0, 349.23, 0, 392.00, 0, 293.66, 0, 293.66, 0, 349.23, 392.00, 440.00, 0,
            440.00, 392.00, 0, 349.23, 0, 392.00, 440.00, 0, 466.16, 0, 440.00, 392.00, 349.23, 293.66, 0, 0
        ],
        perc: [
            'K','H','S','H','K','H','S','H','K','H','S','H','K','K','S','H',
            'K','H','S','H','K','H','S','K','K','H','S','H','K','K','S','H',
            'K','H','S','H','K','H','S','H','K','H','S','H','K','K','S','H',
            'K','H','S','H','K','H','S','K','K','H','S','H','K','H','S','H',
            'K','H','H','H','S','H','H','H','K','H','H','H','S','H','H','H',
            'K','H','H','H','S','H','H','H','K','H','H','H','S','H','H','H',
            'K','H','S','H','K','H','S','H','K','H','S','H','K','K','S','H',
            'K','H','S','H','K','K','S','H','K','H','S','K','K','H','S','K'
        ]
    },

    // ─── Bioma 4: Nieve (85 BPM) ─────────────────────────────────────────────
    // Fa menor – Glacial, melancólico, campanillas de hielo
    {
        steps: 128,
        bass: [
            // Comp 1-2: Notas largas glaciales
            87.31, 0, 0, 0, 130.81, 0, 0, 0, 77.78, 0, 0, 0, 116.54, 0, 0, 0,
            87.31, 0, 0, 0, 103.83, 0, 0, 0, 130.81, 0, 0, 0, 87.31,  0, 0, 0,
            // Comp 3-4: Descenso melancólico
            103.83, 0, 0, 0, 98.00, 0, 0, 0, 92.50, 0, 0, 0, 87.31, 0, 0, 0,
            77.78,  0, 0, 0, 87.31, 0, 0, 0, 103.83,0, 0, 0, 130.81,0, 0, 0,
            // Comp 5-6: Expansión armónica
            87.31,  0, 0, 87.31, 0, 0, 130.81, 0, 0, 0, 130.81, 0, 116.54, 0, 0, 0,
            103.83, 0, 0, 0, 103.83, 0, 77.78, 0, 0, 0, 87.31, 0, 0, 0, 87.31, 0,
            // Comp 7-8: Regreso glacial
            87.31, 0, 0, 0, 130.81, 0, 0, 0, 77.78, 0, 0, 0, 116.54, 0, 0, 0,
            87.31, 0, 0, 0, 0,    0, 87.31, 0, 0, 0, 130.81, 0, 0, 0, 0, 0
        ],
        lead: [
            349.23, 0, 392.00, 0, 466.16, 0, 523.25, 0, 392.00, 0, 349.23, 0, 311.13, 0, 0, 0,
            349.23, 0, 392.00, 466.16, 0, 523.25, 466.16, 0, 392.00, 0, 349.23, 0, 311.13, 0, 349.23, 0,
            466.16, 0, 523.25, 0, 587.33, 0, 622.25, 587.33, 0, 523.25, 0, 466.16, 0, 392.00, 349.23, 0,
            311.13, 0, 349.23, 0, 392.00, 0, 349.23, 0, 392.00, 0, 466.16, 0, 392.00, 0, 349.23, 0,
            523.25, 0, 0, 466.16, 0, 0, 523.25, 0, 587.33, 0, 0, 523.25, 0, 466.16, 0, 392.00,
            349.23, 392.00, 0, 466.16, 0, 523.25, 0, 466.16, 392.00, 0, 349.23, 0, 311.13, 0, 349.23, 0,
            349.23, 0, 392.00, 0, 466.16, 0, 523.25, 0, 466.16, 0, 392.00, 0, 349.23, 0, 311.13, 0,
            349.23, 0, 0, 0, 392.00, 0, 0, 0, 466.16, 0, 0, 0, 349.23, 0, 0, 0
        ],
        perc: [
            'K','H','H','H','S','H','H','H','K','H','H','H','S','H','H','K',
            'K','H','H','H','S','H','H','H','K','H','H','H','S','H','H','H',
            'K','H','H','H','S','H','H','H','K','H','H','H','S','H','H','K',
            'K','H','H','H','S','H','H','H','K','H','H','H','S','H','H','H',
            'K','H','H','H','S','H','H','H','K','H','H','H','S','H','H','K',
            'K','H','H','H','S','H','H','H','K','H','H','H','S','H','H','H',
            'K','H','H','H','S','H','H','H','K','H','H','H','S','H','H','K',
            'K','H','H','H','S','H','H','H','K','H','H','H','H','H','H','H'
        ]
    },

    // ─── Bioma 5: Montaña (115 BPM) ──────────────────────────────────────────
    // Sol menor – Épico marcial, bajo de sierra agresivo
    {
        steps: 128,
        bass: [
            // Comp 1-2: Marcha épica Gm
            98.00, 98.00, 98.00, 98.00, 77.78, 77.78, 77.78, 77.78, 87.31, 87.31, 87.31, 87.31, 98.00, 98.00, 98.00, 0,
            98.00, 98.00, 98.00, 0, 77.78, 77.78, 0, 0, 87.31, 0, 87.31, 0, 98.00, 0, 0, 0,
            // Comp 3-4: Variación D-G
            73.42, 73.42, 73.42, 73.42, 87.31, 87.31, 87.31, 87.31, 98.00, 98.00, 98.00, 98.00, 116.54, 116.54, 0, 0,
            98.00, 0, 98.00, 0, 77.78, 0, 77.78, 0, 87.31, 0, 87.31, 87.31, 98.00, 0, 77.78, 0,
            // Comp 5-6: Puente épico potente
            65.41, 65.41, 0, 0, 65.41, 65.41, 0, 0, 98.00, 98.00, 0, 0, 77.78, 77.78, 0, 0,
            87.31, 87.31, 0, 0, 98.00, 0, 98.00, 0, 77.78, 0, 87.31, 0, 98.00, 0, 0, 0,
            // Comp 7-8: Clímax y retorno
            98.00, 98.00, 98.00, 98.00, 77.78, 77.78, 77.78, 77.78, 87.31, 87.31, 87.31, 87.31, 98.00, 98.00, 98.00, 0,
            98.00, 0, 98.00, 98.00, 77.78, 0, 77.78, 77.78, 87.31, 87.31, 0, 0, 98.00, 98.00, 98.00, 0
        ],
        lead: [
            196.00, 0, 196.00, 233.08, 261.63, 0, 261.63, 0, 293.66, 0, 261.63, 0, 196.00, 0, 0, 0,
            196.00, 0, 220.00, 0, 233.08, 261.63, 0, 293.66, 261.63, 0, 233.08, 0, 220.00, 196.00, 0, 0,
            293.66, 0, 293.66, 0, 329.63, 0, 349.23, 0, 392.00, 0, 349.23, 0, 329.63, 293.66, 0, 261.63,
            293.66, 0, 261.63, 0, 246.94, 0, 233.08, 0, 220.00, 0, 196.00, 0, 220.00, 0, 233.08, 0,
            261.63, 0, 293.66, 0, 329.63, 349.23, 0, 392.00, 0, 349.23, 0, 329.63, 0, 293.66, 261.63, 0,
            233.08, 0, 261.63, 0, 293.66, 0, 261.63, 0, 233.08, 261.63, 0, 293.66, 0, 0, 0, 0,
            196.00, 0, 196.00, 233.08, 261.63, 0, 261.63, 0, 293.66, 0, 261.63, 0, 196.00, 0, 0, 0,
            196.00, 233.08, 0, 261.63, 293.66, 0, 329.63, 0, 349.23, 0, 392.00, 349.23, 293.66, 261.63, 196.00, 0
        ],
        perc: [
            'K','H','S','K','K','H','S','H','K','H','S','K','K','H','S','K',
            'K','H','S','K','K','H','S','H','K','H','S','K','K','H','S','H',
            'K','H','S','K','K','H','S','H','K','H','S','K','K','H','S','K',
            'K','H','S','H','K','K','S','H','K','H','S','K','K','H','S','H',
            'K','K','S','K','K','H','S','H','K','K','S','K','K','H','S','H',
            'K','H','S','K','K','H','S','H','K','K','S','K','K','H','S','H',
            'K','H','S','K','K','H','S','H','K','H','S','K','K','H','S','K',
            'K','K','S','K','K','K','S','K','K','H','S','K','K','H','S','K'
        ]
    }
];

/**
 * Patrones de música de JEFE por bioma. 64 pasos (4 compases).
 * Inspirado en el castillo de Mario Bros 1: bajo cromático descendente,
 * ritmo implacable y melodía tensa en modo menor-disminuido.
 * @const
 */
const BOSS_PATTERNS = [
    // ─── Boss 0: Pantano (150 BPM) – "Caimán del Fango" ──────────────────────
    // Bajo cromático B→Bb→A→Ab→G – pesado y acuoso
    {
        steps: 64,
        bass: [
            123.47, 123.47, 0, 116.54, 116.54, 0, 110.00, 110.00, 0, 103.83, 103.83, 0, 98.00, 0, 92.50, 0,
            98.00,  98.00,  0, 92.50,  92.50,  0, 87.31,  87.31,  0, 82.41,  82.41,  0, 87.31, 0, 98.00, 0,
            123.47, 0, 116.54, 0, 110.00, 0, 103.83, 0, 98.00, 103.83, 110.00, 0, 116.54, 0, 123.47, 0,
            123.47, 123.47, 116.54, 116.54, 110.00, 110.00, 103.83, 103.83, 98.00, 0, 0, 0, 123.47, 0, 0, 0
        ],
        lead: [
            261.63, 0, 261.63, 246.94, 233.08, 0, 246.94, 0, 261.63, 0, 246.94, 233.08, 220.00, 233.08, 246.94, 0,
            261.63, 277.18, 261.63, 0, 246.94, 261.63, 0, 246.94, 233.08, 246.94, 0, 220.00, 233.08, 0, 246.94, 0,
            392.00, 0, 369.99, 0, 349.23, 0, 329.63, 0, 311.13, 329.63, 0, 349.23, 0, 329.63, 311.13, 293.66,
            311.13, 293.66, 277.18, 261.63, 246.94, 233.08, 220.00, 233.08, 246.94, 261.63, 0, 0, 261.63, 0, 0, 0
        ],
        perc: [
            'K','K','S','H','K','K','S','H','K','K','S','H','K','K','S','H',
            'K','K','S','H','K','K','S','H','K','K','S','H','K','K','S','H',
            'K','K','S','K','K','K','S','K','K','K','S','K','K','K','S','K',
            'K','K','S','K','K','K','S','K','K','H','H','H','K','K','K','K'
        ]
    },

    // ─── Boss 1: Bosque (155 BPM) – "Serpiente de Vides" ─────────────────────
    // Celta oscuro – bajo cromático A→Ab→G→Gb
    {
        steps: 64,
        bass: [
            110.00, 110.00, 0, 103.83, 103.83, 0, 98.00, 98.00, 0, 92.50, 92.50, 0, 87.31, 0, 98.00, 0,
            110.00, 0, 103.83, 0, 98.00, 0, 92.50, 0, 87.31, 0, 82.41, 87.31, 92.50, 98.00, 0, 0,
            123.47, 123.47, 0, 116.54, 0, 110.00, 0, 103.83, 98.00, 0, 110.00, 0, 123.47, 0, 0, 0,
            110.00, 103.83, 98.00, 92.50, 87.31, 82.41, 87.31, 98.00, 110.00, 0, 0, 0, 110.00, 0, 0, 0
        ],
        lead: [
            220.00, 0, 207.65, 0, 196.00, 0, 185.00, 0, 174.61, 0, 185.00, 196.00, 207.65, 0, 220.00, 0,
            246.94, 0, 261.63, 0, 246.94, 0, 233.08, 220.00, 207.65, 0, 196.00, 0, 207.65, 220.00, 0, 0,
            329.63, 0, 311.13, 0, 293.66, 0, 277.18, 0, 261.63, 0, 277.18, 293.66, 311.13, 0, 329.63, 0,
            311.13, 293.66, 277.18, 261.63, 246.94, 233.08, 246.94, 261.63, 277.18, 293.66, 0, 0, 220.00, 0, 0, 0
        ],
        perc: [
            'K','K','S','H','K','K','S','H','K','K','S','H','K','K','S','H',
            'K','H','S','K','K','K','S','H','K','H','S','K','K','K','S','H',
            'K','K','S','K','K','K','S','K','K','K','S','K','K','K','S','K',
            'K','K','S','K','K','K','S','K','K','H','H','H','K','K','K','K'
        ]
    },

    // ─── Boss 2: Desierto (150 BPM) – "Escorpión de Arena" ───────────────────
    // Frigio oscuro – bajo E→Eb→D→Db cromático urgente
    {
        steps: 64,
        bass: [
            82.41, 82.41, 0, 77.78, 77.78, 0, 73.42, 73.42, 0, 69.30, 69.30, 0, 65.41, 0, 69.30, 0,
            73.42, 0, 69.30, 0, 65.41, 0, 61.74, 0, 58.27, 0, 61.74, 65.41, 69.30, 73.42, 0, 0,
            82.41, 0, 77.78, 0, 73.42, 0, 69.30, 0, 65.41, 0, 69.30, 0, 73.42, 0, 77.78, 0,
            82.41, 82.41, 0, 82.41, 87.31, 0, 82.41, 0, 77.78, 82.41, 87.31, 92.50, 82.41, 0, 0, 0
        ],
        lead: [
            164.81, 0, 174.61, 0, 164.81, 0, 155.56, 0, 146.83, 0, 155.56, 164.81, 0, 174.61, 185.00, 0,
            207.65, 0, 185.00, 174.61, 0, 164.81, 0, 155.56, 164.81, 0, 174.61, 0, 185.00, 0, 164.81, 0,
            220.00, 0, 207.65, 0, 196.00, 185.00, 0, 174.61, 0, 164.81, 174.61, 185.00, 0, 207.65, 0, 0,
            164.81, 155.56, 146.83, 138.59, 130.81, 138.59, 146.83, 155.56, 164.81, 174.61, 0, 0, 164.81, 0, 0, 0
        ],
        perc: [
            'K','K','S','H','H','K','S','H','K','K','S','H','H','K','S','H',
            'K','K','S','H','H','K','S','H','K','K','S','H','H','K','S','H',
            'K','K','S','K','K','K','S','K','K','K','S','K','K','K','S','K',
            'K','K','S','K','K','K','S','K','K','H','H','H','K','K','K','K'
        ]
    },

    // ─── Boss 3: Ciudad (165 BPM) – "Megadrón de Asfalto" ───────────────────
    // Cyberpunk industrial – bajo D→Db→C→B implacable
    {
        steps: 64,
        bass: [
            73.42, 73.42, 0, 69.30, 69.30, 0, 65.41, 65.41, 0, 61.74, 61.74, 0, 65.41, 0, 69.30, 0,
            73.42, 0, 69.30, 0, 65.41, 0, 61.74, 0, 58.27, 0, 61.74, 65.41, 69.30, 73.42, 0, 0,
            77.78, 77.78, 0, 73.42, 73.42, 0, 69.30, 69.30, 0, 65.41, 65.41, 0, 69.30, 73.42, 0, 0,
            73.42, 69.30, 65.41, 61.74, 58.27, 55.00, 58.27, 61.74, 65.41, 69.30, 73.42, 0, 73.42, 0, 0, 0
        ],
        lead: [
            293.66, 0, 277.18, 0, 261.63, 0, 246.94, 0, 233.08, 0, 246.94, 261.63, 277.18, 0, 293.66, 0,
            311.13, 0, 329.63, 311.13, 0, 293.66, 0, 277.18, 261.63, 0, 277.18, 0, 293.66, 0, 261.63, 0,
            349.23, 0, 329.63, 0, 311.13, 0, 293.66, 277.18, 0, 261.63, 0, 277.18, 0, 293.66, 311.13, 0,
            329.63, 311.13, 293.66, 277.18, 261.63, 246.94, 261.63, 277.18, 293.66, 0, 0, 0, 293.66, 0, 0, 0
        ],
        perc: [
            'K','K','S','H','K','K','S','H','K','K','S','H','K','K','S','H',
            'K','K','S','K','K','K','S','H','K','K','S','K','K','K','S','H',
            'K','K','S','K','K','K','S','K','K','K','S','K','K','K','S','K',
            'K','K','S','K','K','K','S','K','K','K','K','K','K','K','K','K'
        ]
    },

    // ─── Boss 4: Nieve (145 BPM) – "Abominable Yeti" ─────────────────────────
    // Glacial ominoso – bajo F→E→Eb→D denso y frío
    {
        steps: 64,
        bass: [
            87.31, 87.31, 0, 82.41, 82.41, 0, 77.78, 77.78, 0, 73.42, 73.42, 0, 77.78, 0, 82.41, 0,
            87.31, 0, 82.41, 0, 77.78, 0, 73.42, 0, 69.30, 0, 65.41, 69.30, 73.42, 77.78, 0, 0,
            92.50, 92.50, 0, 87.31, 87.31, 0, 82.41, 82.41, 0, 77.78, 0, 73.42, 0, 77.78, 82.41, 0,
            87.31, 82.41, 77.78, 73.42, 69.30, 65.41, 69.30, 73.42, 77.78, 82.41, 87.31, 0, 87.31, 0, 0, 0
        ],
        lead: [
            349.23, 0, 329.63, 0, 311.13, 0, 293.66, 0, 277.18, 0, 293.66, 311.13, 0, 329.63, 349.23, 0,
            392.00, 0, 369.99, 0, 349.23, 329.63, 0, 311.13, 0, 293.66, 311.13, 0, 329.63, 349.23, 0, 0,
            466.16, 0, 440.00, 0, 415.30, 0, 392.00, 369.99, 0, 349.23, 0, 369.99, 0, 392.00, 415.30, 0,
            440.00, 415.30, 392.00, 369.99, 349.23, 329.63, 349.23, 369.99, 392.00, 0, 0, 0, 349.23, 0, 0, 0
        ],
        perc: [
            'K','K','S','H','K','K','S','H','K','K','S','H','K','K','S','H',
            'K','H','S','K','K','K','S','H','K','H','S','K','K','K','S','H',
            'K','K','S','K','K','K','S','K','K','K','S','K','K','K','S','K',
            'K','K','S','K','K','K','S','K','K','H','H','H','K','K','K','K'
        ]
    },

    // ─── Boss 5: Montaña (158 BPM) – "Dragón de Obsidiana" ──────────────────
    // Épico-oscuro – bajo G→Gb→F→E marcial y demoledor
    {
        steps: 64,
        bass: [
            98.00, 98.00, 0, 92.50, 92.50, 0, 87.31, 87.31, 0, 82.41, 82.41, 0, 87.31, 0, 92.50, 0,
            98.00, 0, 92.50, 0, 87.31, 0, 82.41, 0, 77.78, 0, 82.41, 87.31, 92.50, 98.00, 0, 0,
            103.83, 103.83, 0, 98.00, 98.00, 0, 92.50, 92.50, 0, 87.31, 87.31, 0, 92.50, 98.00, 0, 0,
            98.00, 92.50, 87.31, 82.41, 77.78, 73.42, 77.78, 82.41, 87.31, 92.50, 98.00, 103.83, 98.00, 0, 0, 0
        ],
        lead: [
            196.00, 0, 185.00, 0, 174.61, 0, 164.81, 0, 155.56, 0, 164.81, 174.61, 185.00, 0, 196.00, 0,
            220.00, 0, 207.65, 196.00, 0, 185.00, 0, 174.61, 155.56, 0, 164.81, 174.61, 185.00, 196.00, 0, 0,
            261.63, 0, 246.94, 0, 233.08, 0, 220.00, 207.65, 0, 196.00, 0, 207.65, 0, 220.00, 233.08, 0,
            246.94, 233.08, 220.00, 207.65, 196.00, 185.00, 196.00, 207.65, 220.00, 233.08, 246.94, 0, 196.00, 0, 0, 0
        ],
        perc: [
            'K','K','S','K','K','K','S','H','K','K','S','K','K','K','S','H',
            'K','K','S','K','K','K','S','H','K','K','S','K','K','K','S','H',
            'K','K','S','K','K','K','S','K','K','K','S','K','K','K','S','K',
            'K','K','S','K','K','K','S','K','K','K','K','K','K','K','K','K'
        ]
    }
];

/** Tempos normales por bioma (BPM). */
const NORMAL_TEMPOS = [90, 105, 100, 125, 85, 115];
/** Tempos de jefe por bioma (BPM) – más rápidos y tensos. */
const BOSS_TEMPOS   = [150, 155, 150, 165, 145, 158];

/**
 * @class MusicSequencer
 * @description Secuenciador y tracker de audio procedural en tiempo real.
 * Maneja patrones normales de bioma y patrones de jefe de forma independiente.
 */
export class ProceduralMusic {
    /** @param {AudioSynth} sfx - Instancia compartida del sintetizador de efectos. */
    constructor(sfx) {
        this.sfx = sfx;
        this.tempo = 90;
        this.isPlaying = false;
        this.muted = false;
        this.volume = 0.7;
        this.isBossMode = false;

        this.timerId = null;
        this.nextNoteTime = 0.0;
        this.currentStep = 0;
        this.scheduleAheadTime = 0.15;
        this.lookahead = 40.0;

        this.biomeIndex = 0;
        this.masterGain = null;
    }

    /**
     * Inicializa los nodos de ganancia y los enlaza al destino del contexto de Audio común.
     */
    init() {
        this.sfx.init();
        if (!this.masterGain && this.sfx.ctx) {
            this.masterGain = this.sfx.ctx.createGain();
            this.masterGain.gain.value = this.muted ? 0.0 : 0.18 * this.volume;
            this.masterGain.connect(this.sfx.ctx.destination);
        }
    }

    /** Arranca la reproducción del secuenciador. */
    start() {
        if (this.isPlaying) return;
        this.init();
        this.isPlaying = true;
        this.currentStep = 0;
        this.nextNoteTime = this.sfx.ctx.currentTime + 0.05;
        this.scheduler();
    }

    /** Detiene el secuenciador y limpia los temporizadores. */
    stop() {
        this.isPlaying = false;
        if (this.timerId) {
            clearTimeout(this.timerId);
            this.timerId = null;
        }
    }

    /**
     * Silencia o reactiva la música de fondo.
     * @param {boolean} muted
     */
    setMuted(muted) {
        this.muted = muted;
        if (this.masterGain) {
            const targetGain = this.isBossMode ? 0.22 : 0.18;
            this.masterGain.gain.setValueAtTime(muted ? 0.0 : targetGain * this.volume, this.sfx.ctx.currentTime);
        }
    }

    /**
     * Ajusta el volumen maestro de la música.
     * @param {number} vol - Nivel entre 0.0 y 1.0.
     */
    setVolume(vol) {
        this.volume = vol;
        if (this.masterGain) {
            const targetGain = this.isBossMode ? 0.22 : 0.18;
            this.masterGain.gain.setValueAtTime(this.muted ? 0.0 : targetGain * this.volume, this.sfx.ctx.currentTime);
        }
    }

    /**
     * Cambia el bioma activo y actualiza el tempo correspondiente.
     * @param {number} index - Índice del bioma (0 a 5).
     */
    setBiome(index) {
        this.biomeIndex = index;
        this.tempo = this.isBossMode ? (BOSS_TEMPOS[index] || 150) : (NORMAL_TEMPOS[index] || 100);
        this.currentStep = 0;
    }

    /**
     * Activa o desactiva el modo de música de jefe.
     * Al activarlo cambia al patrón boss del bioma actual con su tempo más rápido y urgente.
     * @param {boolean} enabled - true para música de jefe, false para música normal.
     */
    setBossMode(enabled) {
        if (this.isBossMode === enabled) return;
        this.isBossMode = enabled;
        this.currentStep = 0;
        this.tempo = enabled
            ? (BOSS_TEMPOS[this.biomeIndex] || 150)
            : (NORMAL_TEMPOS[this.biomeIndex] || 100);

        if (this.masterGain && this.sfx.ctx) {
            const targetGain = enabled ? 0.22 : 0.18;
            this.masterGain.gain.setValueAtTime(
                this.muted ? 0.0 : targetGain * this.volume,
                this.sfx.ctx.currentTime
            );
        }
    }

    /**
     * Planificador cíclico que agenda eventos de audio con precisión de tiempo real.
     */
    scheduler() {
        if (!this.isPlaying) return;
        if (this.nextNoteTime < this.sfx.ctx.currentTime) {
            this.nextNoteTime = this.sfx.ctx.currentTime;
        }
        while (this.nextNoteTime < this.sfx.ctx.currentTime + this.scheduleAheadTime) {
            this.scheduleStep(this.currentStep, this.nextNoteTime);
            this.advanceStep();
        }
        this.timerId = setTimeout(() => this.scheduler(), this.lookahead);
    }

    /**
     * Avanza el cabezal de pasos usando la longitud del patrón activo.
     */
    advanceStep() {
        const pattern = this.isBossMode ? BOSS_PATTERNS[this.biomeIndex] : BIOME_PATTERNS[this.biomeIndex];
        const secondsPerBeat = 60.0 / this.tempo;
        const secondsPerStep = secondsPerBeat / 4.0;

        this.nextNoteTime += secondsPerStep;
        this.currentStep = (this.currentStep + 1) % pattern.steps;
    }

    /**
     * Sintetiza y agenda los eventos de notas e instrumentos para un paso dado.
     * @param {number} step - Paso actual del bucle.
     * @param {number} time - Tiempo exacto del contexto de audio.
     */
    scheduleStep(step, time) {
        const pattern = this.isBossMode ? BOSS_PATTERNS[this.biomeIndex] : BIOME_PATTERNS[this.biomeIndex];
        if (!pattern) return;

        // 1. Canal de Bajo (Bassline)
        const bassFreq = pattern.bass[step];
        if (bassFreq > 0) {
            const osc  = this.sfx.ctx.createOscillator();
            const gain = this.sfx.ctx.createGain();
            osc.connect(gain);
            gain.connect(this.masterGain);

            // Biomas urbanos/montaña y todos los boss usan ondas de sierra agresivas
            osc.type = (this.isBossMode || this.biomeIndex === 3 || this.biomeIndex === 5) ? 'sawtooth' : 'triangle';
            osc.frequency.setValueAtTime(bassFreq, time);

            const bassVol = this.isBossMode ? 0.45 : 0.35;
            gain.gain.setValueAtTime(bassVol, time);
            gain.gain.exponentialRampToValueAtTime(0.001, time + 0.25);

            osc.start(time);
            osc.stop(time + 0.25);
        }

        // 2. Canal de Melodía (Lead)
        const leadFreq = pattern.lead[step];
        if (leadFreq > 0) {
            if (this.biomeIndex === 3 && !this.isBossMode) {
                // Síntesis FM metálica para Ciudad (modo normal)
                const carrier   = this.sfx.ctx.createOscillator();
                const modulator = this.sfx.ctx.createOscillator();
                const modGain   = this.sfx.ctx.createGain();
                const cGain     = this.sfx.ctx.createGain();

                carrier.type   = 'sine';
                modulator.type = 'sine';
                carrier.frequency.setValueAtTime(leadFreq, time);
                modulator.frequency.setValueAtTime(leadFreq * 2.0, time);
                modGain.gain.setValueAtTime(leadFreq * 1.5, time);

                modulator.connect(modGain);
                modGain.connect(carrier.frequency);
                carrier.connect(cGain);
                cGain.connect(this.masterGain);

                cGain.gain.setValueAtTime(0.35, time);
                cGain.gain.exponentialRampToValueAtTime(0.001, time + 0.2);

                modulator.start(time); modulator.stop(time + 0.2);
                carrier.start(time);   carrier.stop(time + 0.2);
            } else {
                // Síntesis clásica retro
                const osc  = this.sfx.ctx.createOscillator();
                const gain = this.sfx.ctx.createGain();
                osc.connect(gain);
                gain.connect(this.masterGain);

                // Boss usa square agresivo; Nieve usa sine cristalino; resto square retro
                osc.type = this.isBossMode ? 'square' : (this.biomeIndex === 4 ? 'sine' : 'square');
                osc.frequency.setValueAtTime(leadFreq, time);

                gain.gain.setValueAtTime(0.35, time);
                gain.gain.exponentialRampToValueAtTime(0.001, time + 0.22);

                osc.start(time);
                osc.stop(time + 0.23);

                // Eco/delay solo en modo normal (boss no tiene eco – más urgente)
                if (!this.isBossMode) {
                    const echoDelay = 0.15;
                    const echoOsc  = this.sfx.ctx.createOscillator();
                    const echoGain = this.sfx.ctx.createGain();
                    echoOsc.connect(echoGain);
                    echoGain.connect(this.masterGain);

                    echoOsc.type = osc.type;
                    echoOsc.frequency.setValueAtTime(leadFreq, time + echoDelay);

                    echoGain.gain.setValueAtTime(0.15, time + echoDelay);
                    echoGain.gain.exponentialRampToValueAtTime(0.001, time + echoDelay + 0.18);

                    echoOsc.start(time + echoDelay);
                    echoOsc.stop(time + echoDelay + 0.19);
                }
            }
        }

        // 3. Canal de Percusión
        const percChar = pattern.perc[step];
        if (percChar === 'K') {
            // Bombo – más grave y largo en boss
            const osc  = this.sfx.ctx.createOscillator();
            const gain = this.sfx.ctx.createGain();
            osc.connect(gain);
            gain.connect(this.masterGain);

            osc.type = 'triangle';
            const kickFreq = this.isBossMode ? 150 : 130;
            osc.frequency.setValueAtTime(kickFreq, time);
            osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.11);

            const kickVol = this.isBossMode ? 0.70 : 0.55;
            gain.gain.setValueAtTime(kickVol, time);
            gain.gain.exponentialRampToValueAtTime(0.001, time + 0.11);

            osc.start(time);
            osc.stop(time + 0.11);

        } else if (percChar === 'S') {
            // Caja / Snare
            const bufferSize = this.sfx.ctx.sampleRate * 0.11;
            const buffer = this.sfx.ctx.createBuffer(1, bufferSize, this.sfx.ctx.sampleRate);
            const data   = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

            const noise  = this.sfx.ctx.createBufferSource();
            noise.buffer = buffer;
            const filter = this.sfx.ctx.createBiquadFilter();
            filter.type  = 'bandpass';
            filter.frequency.setValueAtTime(this.isBossMode ? 1400 : 1000, time);
            const gain = this.sfx.ctx.createGain();

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.masterGain);

            const snareVol = this.isBossMode ? 0.30 : 0.20;
            gain.gain.setValueAtTime(snareVol, time);
            gain.gain.exponentialRampToValueAtTime(0.001, time + 0.11);

            noise.start(time);
            noise.stop(time + 0.11);

        } else if (percChar === 'H') {
            // Platillo cerrado (Hi-hat)
            const bufferSize = this.sfx.ctx.sampleRate * 0.03;
            const buffer = this.sfx.ctx.createBuffer(1, bufferSize, this.sfx.ctx.sampleRate);
            const data   = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

            const noise  = this.sfx.ctx.createBufferSource();
            noise.buffer = buffer;
            const filter = this.sfx.ctx.createBiquadFilter();
            filter.type  = 'highpass';
            filter.frequency.setValueAtTime(9000, time);
            const gain = this.sfx.ctx.createGain();

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.masterGain);

            gain.gain.setValueAtTime(0.15, time);
            gain.gain.exponentialRampToValueAtTime(0.001, time + 0.03);

            noise.start(time);
            noise.stop(time + 0.03);
        }
    }
}
