'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
/**
 * Implements the API of Automerge.WatchableDoc, but backed by an Automerge.DocSet.
 * The motivation behind this is to use Automerge.Connection (which
 * only works with Automerge.DocSet, and not Automerge.WatchableDoc). Another
 * approach could have been to implement a WatchableDocConnection, but that
 * is a lot more work
 */
var DocSetWatchableDoc = /** @class */ (function() {
  function DocSetWatchableDoc(docSet, docId) {
    var _this = this
    this.docSet = docSet
    this.docId = docId
    this.handlers = new Set()
    this.docSet.registerHandler(function(updatedDocId, updatedDoc) {
      if (updatedDocId === docId) {
        _this.handlers.forEach(function(handler) {
          return handler(updatedDoc)
        })
      }
    })
  }
  DocSetWatchableDoc.prototype.get = function() {
    return this.docSet.getDoc(this.docId)
  }
  DocSetWatchableDoc.prototype.set = function(doc) {
    this.docSet.setDoc(this.docId, doc)
  }
  DocSetWatchableDoc.prototype.applyChanges = function(changes) {
    this.docSet.applyChanges(this.docId, changes)
    return this.get()
  }
  DocSetWatchableDoc.prototype.registerHandler = function(handler) {
    this.handlers.add(handler)
  }
  DocSetWatchableDoc.prototype.unregisterHandler = function(handler) {
    this.handlers.delete(handler)
  }
  return DocSetWatchableDoc
})()
exports.default = DocSetWatchableDoc
//# sourceMappingURL=DocSetWatchableDoc.js.map
