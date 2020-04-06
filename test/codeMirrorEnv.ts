// Minimal browser-like environment to make CodeMirror load (for tests in Node.js)
import { JSDOM } from 'jsdom'

const dom = new JSDOM(`<!DOCTYPE html>
<html lang="en">
<body></body>
</html>`)
// https://discuss.codemirror.net/t/working-in-jsdom-or-node-js-natively/138/5
const createRange = dom.window.document.createRange

const patchedCreateRange = function () {
  // @ts-ignore
  const range: Range = createRange.apply(this, arguments)
  range.getBoundingClientRect = () => {
    const rect: DOMRect = {
      height: 0,
      width: 0,
      bottom: 0,
      left: 0,
      right: 0,
      top: 0,
      x: 0,
      y: 0,
      toJSON(): any {
        {
        }
      },
    }
    return rect
  }
  range.getClientRects = () => {
    const rects: DOMRectList = {
      item(index: number): DOMRect | null {
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
