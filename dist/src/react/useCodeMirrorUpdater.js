'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
var react_1 = require('react')
var index_1 = require('../../index')
function useCodeMirrorUpdater(watchableDoc, mutex, links) {
  react_1.useEffect(
    function() {
      var doc = watchableDoc.get()
      var handler = function(newDoc) {
        doc = index_1.updateCodeMirrorDocs(doc, newDoc, links, mutex)
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
