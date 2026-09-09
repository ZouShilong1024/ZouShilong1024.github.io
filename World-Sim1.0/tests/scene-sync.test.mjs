import assert from 'node:assert/strict';
import { createSceneGroup } from '../assets/js/scene-sync.js';
globalThis.document = { hidden: false };
let next;
globalThis.requestAnimationFrame = fn => { next = fn; return 1; };
globalThis.cancelAnimationFrame = () => { next = null; };
class Video extends EventTarget {
  constructor(duration) { super(); this.duration = duration; }
  currentTime = 0; readyState = 0; paused = true; ended = false; seeking = false;
  play() { this.paused = false; return Promise.resolve(); }
  pause() { this.paused = true; }
  load() {}
}
const a = new Video(10), b = new Video(8);
const group = createSceneGroup([a,b]);
group.activate(); assert(a.paused && b.paused);
a.readyState=4; next(); assert(a.paused && b.paused);
b.readyState=4; next(); assert(!a.paused && !b.paused); assert.equal(b.playbackRate,.8);
a.currentTime=5;b.currentTime=1; next(); assert.equal(b.currentTime,4);
b.readyState=2;b.dispatchEvent(new Event('waiting'));assert(a.paused && b.paused);next();assert(a.paused && b.paused);
b.readyState=4;next();assert(!a.paused && !b.paused);
a.ended=true;next();assert.equal(a.currentTime,0);assert.equal(b.currentTime,0);a.ended=false;
group.pause();assert(a.paused && b.paused);assert.equal(next,null);
group.activate(); document.hidden=true;next();assert(a.paused && b.paused);
console.log('Passed: readiness barrier, duration matching, drift correction, buffering, joint loop, pause and hidden-page handling.');
