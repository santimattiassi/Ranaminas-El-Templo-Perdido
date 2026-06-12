/**
 * Integración con music.js
 * @module audio
 */
import { sfx as realSfx } from './synth.js';
import { ProceduralMusic } from '../../music.js';

export const sfx = realSfx || { playStep:()=>{}, playExplosion:()=>{}, playHeart:()=>{}, playCoin:()=>{}, playWin:()=>{}, playLose:()=>{}, playScan:()=>{}, playBiomeAmbient:()=>{}, playStoneThrow:()=>{}, playFrogSqueeze:()=>{}, playBossDamage:()=>{}, playBossRoar:()=>{} };

let activeBgm = window.bgm;
if (!activeBgm && sfx) {
    activeBgm = new ProceduralMusic(sfx);
    window.bgm = activeBgm;
}
export const bgm = activeBgm || { start:()=>{}, stop:()=>{}, setMuted:()=>{}, setVolume:()=>{}, setBiome:()=>{}, setBossMode:()=>{} };
export function setBossMode(enabled) { if(bgm.setBossMode) bgm.setBossMode(enabled); }
export function setBiome(index) { if(bgm.setBiome) bgm.setBiome(index); }
