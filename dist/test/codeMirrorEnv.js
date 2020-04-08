'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
// Minimal browser-like environment to make CodeMirror load (for tests in Node.js)
var jsdom_1 = require('jsdom')
var dom = new jsdom_1.JSDOM('<!DOCTYPE html>\n<html lang="en">\n<body></body>\n</html>')
// https://discuss.codemirror.net/t/working-in-jsdom-or-node-js-natively/138/5
var createRange = dom.window.document.createRange
var patchedCreateRange = function () {
  // @ts-ignore
  var range = createRange.apply(this, arguments)
  range.getBoundingClientRect = function () {
    var rect = {
      height: 0,
      width: 0,
      bottom: 0,
      left: 0,
      right: 0,
      top: 0,
      x: 0,
      y: 0,
      toJSON: function () {
        {
        }
      },
    }
    return rect
  }
  range.getClientRects = function () {
    var rects = {
      item: function (index) {
        return null
      },
      length: 0,
    }
    return rects
  }
  return range
}
dom.window.document.createRange = patchedCreateRange
// @ts-ignore
global.window = dom.window
// @ts-ignore
global.navigator = dom.window.navigator
// @ts-ignore
global.document = dom.window.document
//# sourceMappingURL=codeMirrorEnv.js.map
