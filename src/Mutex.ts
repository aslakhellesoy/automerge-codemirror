/**
 * This mutex ensures mutual exclusion of CodeMirror and Automerge updates.
 * This is to prevent incoming Automerge changes being propagated to CodeMirror and back again to Automerge.
 */
export default class Mutex {
  private _locked: boolean

  get locked() {
    return this._locked
  }

  lock() {
    if (this._locked) throw new Error(`Already locked`)
    this._locked = true
  }

  release() {
    if (!this._locked) throw new Error(`Not locked`)
    this._locked = false
  }
}
