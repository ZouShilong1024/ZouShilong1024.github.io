import test from "node:test";
import assert from "node:assert/strict";
import { enableTabKeyboard } from "../assets/js/tab-keyboard.js";

test("section tabs wrap and support Home/End without intercepting other keys", () => {
  const events = [];
  const tabs = Array.from({ length: 5 }, (_, index) => ({
    addEventListener(type, handler) { this.handler = handler; },
    focus() { events.push(`focus:${index}`); },
    click() { events.push(`click:${index}`); },
  }));
  enableTabKeyboard(tabs);
  const press = (index, key) => tabs[index].handler({ key, preventDefault() { events.push("prevent"); } });
  press(4, "ArrowRight");
  press(0, "ArrowLeft");
  press(2, "Home");
  press(2, "End");
  press(2, "Tab");
  assert.deepEqual(events, [
    "prevent", "focus:0", "click:0", "prevent", "focus:4", "click:4",
    "prevent", "focus:0", "click:0", "prevent", "focus:4", "click:4",
  ]);
});
