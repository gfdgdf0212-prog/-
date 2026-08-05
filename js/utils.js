import { SUFFIX, I18N } from './config.js';

export const $ = s => document.querySelector(s);
export const TAU = Math.PI * 2;
export const ISO = 0.48;
export const clamp = (v,a,b) => v<a?a:v>b?b:v;
export const rand = (a,b) => a + Math.random()*(b-a);
export const lerp = (a,b,t) => a + (b-a)*t;
export const smooth = t => t*t*(3-2*t);

export function fmt(n){ /* …как в оригинале… */ }
export const fmtS = v => { /* … */ };
export function fmtTime(s){ /* … */ }
export function dayKey(){ /* … */ }
export function weekKey(){ return Math.floor(Date.now()/604800000); }
export function rng(seed){ /* … */ }
export function safeInt(v,def){ /* … */ }

// требует S.lang → передаётся язык, либо читается из state
export const t = (k,o,lang) => { /* I18N[lang||'ru'][k] */ };
export const LN = (o,lang) => o[lang||'ru'] || o.ru;
