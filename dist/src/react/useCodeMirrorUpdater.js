'use strict'
var __importDefault =
  (this && this.__importDefault) ||
  function(mod) {
    return mod && mod.__esModule ? mod : { default: mod }
  }
Object.defineProperty(exports, '__esModule', { value: true })
var react_1 = require('react')
var updateCodeMirrorDocs_1 = __importDefault(require('../updateCodeMirrorDocs'))
/**
 * This hook updates CodeMirror instances when {@link watchableDoc} changes.
 *
 * @param watchableDoc the doc to observe
 * @param mutex
 * @param links
 */
function useCodeMirrorUpdater(watchableDoc, mutex, links) {
  react_1.useEffect(
    function() {
      var doc = watchableDoc.get()
      var handler = function(newDoc) {
        doc = updateCodeMirrorDocs_1.default(doc, newDoc, links, mutex)
      }
      watchableDoc.registerHandler(handler)
      return function() {
        return watchableDoc.unregisterHandler(handler)
      }
    },
    [watchableDoc, mutex, links]
  )
}
exports.default = useCodeMirrorUpdater
//# sourceMappingURL=useCodeMirrorUpdater.js.map
