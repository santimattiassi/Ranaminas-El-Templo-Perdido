/**
 * Integración con music.js
 * @module audio
 */
export const sfx = window.sfx || { playStep:()=>{}, playExplosion:()=>{}, playHeart:()=>{}, playCoin:()=>{}, playWin:()=>{}, playLose:()=>{}, playScan:()=>{}, playBiomeAmbient:()=>{}, playStoneThrow:()=>{}, playFrogSqueeze:()=>{}, playBossDamage:()=>{}, playBossRoar:()=>{} };
export const bgm = window.bgm || { start:()=>{}, stop:()=>{}, setMuted:()=>{}, setVolume:()=>{}, setBiome:()=>{}, setBossMode:()=>{} };
export function setBossMode(enabled) { if(bgm.setBossMode) bgm.setBossMode(enabled); }
export function setBiome(index) { if(bgm.setBiome) bgm.setBiome(index); }
