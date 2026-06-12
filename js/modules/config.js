/**
 * Configuración central del juego.
 * @module config
 */
export const BIOMES = [
    { name: 'Pantano', unexplored: '#142c1d', depth: '#0a1a0e', active: '#10b981', activeDepth: '#064e3b', floor: '#0c120d', floorDepth: '#030504', highlight: '#34d399', badgeStyle: 'bg-emerald-950/80 text-emerald-400 border-emerald-500/20', glowColor: 'rgba(16,185,129,0.4)', wrapperBorder: 'border-emerald-500/50', imageSrc: 'img/pantano.png', overlayColor: 'rgba(5, 20, 10, 0.40)' },
    { name: 'Bosque', unexplored: '#273526', depth: '#141c13', active: '#22c55e', activeDepth: '#14532d', floor: '#0f140e', floorDepth: '#040604', highlight: '#4ade80', badgeStyle: 'bg-green-950/80 text-green-400 border-green-500/20', glowColor: 'rgba(34,197,94,0.4)', wrapperBorder: 'border-green-500/50', imageSrc: 'img/bosque.png', overlayColor: 'rgba(8, 20, 10, 0.42)' },
    { name: 'Desierto', unexplored: '#4d3319', depth: '#2b1c0e', active: '#ea580c', activeDepth: '#7c2d12', floor: '#1c1510', floorDepth: '#090604', highlight: '#f97316', badgeStyle: 'bg-amber-950/80 text-amber-400 border-amber-500/20', glowColor: 'rgba(245,158,11,0.4)', wrapperBorder: 'border-amber-500/50', imageSrc: 'img/desierto.png', overlayColor: 'rgba(25, 12, 4, 0.42)' },
    { name: 'Ciudad', unexplored: '#2e2a52', depth: '#1a1836', active: '#6366f1', activeDepth: '#3730a3', floor: '#0a0914', floorDepth: '#030308', highlight: '#818cf8', badgeStyle: 'bg-indigo-950/80 text-indigo-400 border-indigo-500/20', glowColor: 'rgba(99,102,241,0.4)', wrapperBorder: 'border-indigo-500/50', imageSrc: 'img/ciudad.png', overlayColor: 'rgba(10, 8, 25, 0.45)' },
    { name: 'Nieve', unexplored: '#1e305e', depth: '#0f1b3b', active: '#06b6d4', activeDepth: '#0891b2', floor: '#f1f5f9', floorDepth: '#cbd5e1', highlight: '#22d3ee', badgeStyle: 'bg-sky-950/80 text-sky-400 border-sky-500/20', glowColor: 'rgba(56,189,248,0.4)', wrapperBorder: 'border-sky-500/50', imageSrc: 'img/nieve.png', overlayColor: 'rgba(8, 16, 32, 0.42)' },
    { name: 'Montaña', unexplored: '#333333', depth: '#1c1c1c', active: '#ef4444', activeDepth: '#991b1b', floor: '#171717', floorDepth: '#0a0a0a', highlight: '#f87171', badgeStyle: 'bg-red-950/80 text-rose-400 border-rose-500/20', glowColor: 'rgba(239,68,68,0.4)', wrapperBorder: 'border-rose-500/50', imageSrc: 'img/montana.png', overlayColor: 'rgba(16, 10, 10, 0.42)' }
];
export const INITIAL_INVENTORY = [
    { id: 'shield', name: 'Escudo de Faraday', desc: 'Te protege de la próxima mina.', cost: 6, icon: '🛡️', type: 'shield', quantity: 0 },
    { id: 'scanner', name: 'Escáner de Pulso', desc: 'Revela 3x3 de forma segura.', cost: 5, icon: '📡', type: 'active', quantity: 0 },
    { id: 'jump', name: 'Ancla de Salto', desc: 'Salta a un radio de 2 de distancia.', cost: 4, icon: '🪂', type: 'active', quantity: 0 },
    { id: 'potion', name: 'Poción de Vida', desc: 'Restaura 1 corazón de vida al instante.', cost: 10, icon: '🧪', type: 'use', quantity: 0 },
    { id: 'boots', name: 'Botas de Velocidad', desc: 'Aumenta tu velocidad en este nivel.', cost: 5, icon: '🥾', type: 'active', quantity: 0 },
    { id: 'magnifier', name: 'Lupa de Vidente', desc: 'Encuentra y marca 1 mina oculta.', cost: 6, icon: '🔍', type: 'active', quantity: 0 },
    { id: 'elixir', name: 'Elixir de Inmunidad', desc: 'Inmune a ataques de jefes por 6s.', cost: 8, icon: '✨', type: 'active', quantity: 0 }
];
export const GRID_CONFIG = { cols: 10, rows: 8, cellSize: 48, depthHeight: 10 };