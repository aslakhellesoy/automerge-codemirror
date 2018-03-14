// Minimal browser-like environment to make CodeMirror load (for tests in Node.js)
const { JSDOM } = require('jsdom')
const dom = new JSDOM(
  '<html><body>' +
    '<div id="editor"></div>' +
    '</body></html>'
)
global.window = dom.window
global.navigator = dom.window.navigator
global.document = dom.window.document
// https://discuss.codemirror.net/t/working-in-jsdom-or-node-js-natively/138/5
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
