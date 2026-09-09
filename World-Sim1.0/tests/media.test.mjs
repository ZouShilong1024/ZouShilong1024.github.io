import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createMediaLoader } from '../assets/js/media.js';

globalThis.window = globalThis;
class Video extends EventTarget {
  load() {}
  ready() { this.dispatchEvent(new Event('loadeddata')); }
}

test('a replacement load cancels old callbacks and waits for every video', () => {
  const videos = [new Video(), new Video()];
  const loader = createMediaLoader(videos);
  let stale = 0;
  let ready = 0;
  loader.load(() => {}, () => stale++, () => stale++);
  videos[0].ready();
  loader.load(() => {}, () => ready++, () => assert.fail('unexpected fallback'));
  videos[1].ready();
  assert.equal(ready, 0);
  videos[0].ready();
  assert.equal(stale, 0);
  assert.equal(ready, 1);
  videos.forEach(video => video.ready());
  assert.equal(ready, 1);
  loader.cancel();
});

test('release cancels pending listeners and fallback', async () => {
  const videos = [new Video()];
  const loader = createMediaLoader(videos);
  let callbacks = 0;
  loader.load(() => {}, () => callbacks++, () => callbacks++);
  loader.cancel();
  videos[0].ready();
  await new Promise(resolve => setTimeout(resolve, 950));
  assert.equal(callbacks, 0);
});
