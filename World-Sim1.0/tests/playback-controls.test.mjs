import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createVideoGallery } from '../assets/js/video-gallery.js';
import { initOverview } from '../assets/js/overview.js';
import { initReverseGallery } from '../assets/js/reverse-gallery.js';
import { initStandaloneVideos } from '../assets/js/media.js';

class Element extends EventTarget {
  dataset = {};
  children = [];
  attributes = {};
  classList = { add() {}, remove() {}, toggle() {} };
  readyState = 2;
  currentTime = 4;
  duration = 10;
  playbackRate = 1;
  plays = 0;
  pauses = 0;
  append(...children) { this.children.push(...children); }
  appendChild(child) { this.children.push(child); return child; }
  setAttribute(key, value) { this.attributes[key] = value; }
  getAttribute(key) { return this.attributes[key]; }
  removeAttribute(key) { delete this.attributes[key]; }
  scrollTo() {}
  play() { this.plays++; return Promise.resolve(); }
  pause() { this.pauses++; }
  load() { this.dispatchEvent(new Event('loadeddata')); }
  click() { this.dispatchEvent(new Event('click')); }
}

function environment() {
  const elements = new Map();
  const selectors = new Map();
  const observers = [];
  const doc = new Element();
  doc.hidden = false;
  doc.fullscreenEnabled = false;
  doc.createElement = () => new Element();
  doc.getElementById = id => {
    if (!elements.has(id)) elements.set(id, new Element());
    return elements.get(id);
  };
  doc.querySelectorAll = selector => selectors.get(selector) ?? [];
  globalThis.document = doc;
  globalThis.window = globalThis;
  globalThis.IntersectionObserver = class {
    constructor(callback) { this.callback = callback; observers.push(this); }
    observe(target) { this.target = target; }
    visible(value) { this.callback([{ target: this.target, isIntersecting: value }]); }
  };
  return { doc, selectors, observers };
}

for (const kind of ['overview', 'viewpoint', 'reverse']) {
  test(`${kind}: manual pause survives visibility, reload and play callbacks`, () => {
    const { doc, selectors, observers } = environment();
    const slots = kind === 'overview' ? ['observation', 'action', 'prediction']
      : kind === 'reverse' ? ['forward_action', 'forward_prediction', 'reverse_action', 'reverse_prediction']
      : ['reference', 'view1'];
    const key = kind === 'overview' ? 'overviewStream' : `${kind}Video`;
    const attr = kind === 'overview' ? 'data-overview-stream' : `data-${kind}-video`;
    const videos = slots.map(slot => {
      const video = new Element();
      video.dataset[key] = slot;
      video.setAttribute(attr, slot);
      return video;
    });
    selectors.set(`[${attr}]`, videos);
    const player = kind === 'overview' ? initOverview()
      : kind === 'reverse' ? initReverseGallery()
      : createVideoGallery({ id: kind, tasks: [{ label: 'Task' }], getMedia: () => ({ src: 'demo.mp4', poster: 'demo.jpg', label: 'demo' }) });
    observers[0].visible(true);
    player.setUserPaused(true);
    const before = videos.map(video => video.plays);
    player.play();
    observers[0].visible(false);
    observers[0].visible(true);
    doc.getElementById(`${kind}-next`).click();
    videos[0].dispatchEvent(new Event('play'));
    if (player.release) { player.release(); player.activate(); }
    assert.deepEqual(videos.map(video => video.plays), before);
    player.restart();
    assert.equal(videos[0].currentTime, 0);
    player.setUserPaused(false);
    assert.ok(videos[0].plays > before[0]);
    if (kind === 'reverse') {
      videos[0].dispatchEvent(new Event('ended'));
      player.setUserPaused(true);
      const counts = videos.map(video => video.plays);
      videos[2].dispatchEvent(new Event('ended'));
      assert.deepEqual(videos.map(video => video.plays), counts);
      player.restart();
      player.setUserPaused(false);
      assert.ok(videos[0].plays > counts[0], 'replay begins with forward motion');
    }
  });
}

test('standalone playback respects manual pause after becoming visible again', () => {
  const { selectors, observers } = environment();
  const video = new Element();
  selectors.set('video:not([data-overview-stream]):not([data-viewpoint-video]):not([data-embodiment-video]):not([data-object-video]):not([data-reverse-video])', [video]);
  const standalone = initStandaloneVideos();
  observers[0].visible(true);
  video.dataset.userPaused = "true";
  video.pause();
  const count = video.plays;
  observers[0].visible(false);
  observers[0].visible(true);
  standalone.play();
  assert.equal(video.plays, count);
  video.dataset.userPaused = "false";
  standalone.play();
  assert.equal(video.plays, count + 1);
});

test('overview: both rows switch sources and synchronize within their own task', () => {
  const { doc, selectors, observers } = environment();
  const rows = ['overviewStream', 'overviewSecond'].map(key => ['observation', 'action', 'prediction'].map(slot => {
    const video = new Element();
    video.dataset[key] = slot;
    return video;
  }));
  selectors.set('[data-overview-stream]', rows[0]);
  selectors.set('[data-overview-second]', rows[1]);
  const player = initOverview();
  observers[0].visible(true);
  assert.ok(rows.flat().every(video => video.src && !video.src.includes('undefined')));
  rows[0][0].currentTime = 2;
  rows[1][0].currentTime = 6;
  rows[0][0].dispatchEvent(new Event('timeupdate'));
  rows[1][0].dispatchEvent(new Event('timeupdate'));
  assert.deepEqual(rows.map(row => row.map(video => video.currentTime)), [[2, 2, 2], [6, 6, 6]]);
  const prior = rows.flat().map(video => video.src);
  doc.getElementById('overview-next').click();
  assert.ok(rows.flat().every((video, i) => video.src !== prior[i]));
  player.pause();
  assert.ok(rows.flat().every(video => video.pauses > 0));
});
