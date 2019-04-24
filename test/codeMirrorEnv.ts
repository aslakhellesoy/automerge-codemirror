// Minimal browser-like environment to make CodeMirror load (for tests in Node.js)
import { JSDOM } from 'jsdom'

const dom = new JSDOM('<html><body></body></html>')
// @ts-ignore
global.window = dom.window
// @ts-ignore
global.navigator = dom.window.navigator
// @ts-ignore
global.document = dom.window.document
// https://discuss.codemirror.net/t/working-in-jsdom-or-node-js-natively/138/5
// @ts-ignore
global.document.body.createTextRange = function() {
  return {
    setEnd: function() {},
    setStart: function() {},
    getBoundingClientRect: function() {
      return { right: 0 }
    },
    getClientRects: function() {
      return {
        length: 0,
        left: 0,
        right: 0,
      }
    },
  }
}
