'use strict'
var __read =
  (this && this.__read) ||
  function(o, n) {
    var m = typeof Symbol === 'function' && o[Symbol.iterator]
    if (!m) return o
    var i = m.call(o),
      r,
      ar = [],
      e
    try {
      while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value)
    } catch (error) {
      e = { error: error }
    } finally {
      try {
        if (r && !r.done && (m = i['return'])) m.call(i)
      } finally {
        if (e) throw e.error
      }
    }
    return ar
  }
Object.defineProperty(exports, '__esModule', { value: true })
var react_1 = require('react')
/**
 * This hook updates a state variable when {@link watchableDoc} is updated.
 *
 * @param watchableDoc the doc to observe
 */
function useAutomergeDoc(watchableDoc) {
  var _a = __read(react_1.useState(watchableDoc.get()), 2),
    doc = _a[0],
    setDoc = _a[1]
  react_1.useEffect(function() {
    watchableDoc.registerHandler(setDoc)
    return function() {
      return watchableDoc.unregisterHandler(setDoc)
    }
  }, [])
  return doc
}
exports.default = useAutomergeDoc
//# sourceMappingURL=useAutomergeDoc.js.map
