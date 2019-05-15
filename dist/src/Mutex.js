'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
/**
 * This mutex ensures mutual exclusion of CodeMirror and Automerge updates.
 * This is to prevent incoming Automerge changes being propagated to CodeMirror and back again to Automerge.
 */
var Mutex = /** @class */ (function() {
  function Mutex() {}
  Object.defineProperty(Mutex.prototype, 'locked', {
    get: function() {
      return this._locked
    },
    enumerable: true,
    configurable: true,
  })
  Mutex.prototype.lock = function() {
    if (this._locked) throw new Error('Already locked')
    this._locked = true
  }
  Mutex.prototype.release = function() {
    if (!this._locked) throw new Error('Not locked')
    this._locked = false
  }
  return Mutex
})()
exports.default = Mutex
//# sourceMappingURL=Mutex.js.map
