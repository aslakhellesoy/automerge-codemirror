/**
 * This mutex ensures mutual exclusion of CodeMirror and Automerge updates.
 * This is to prevent incoming Automerge changes being propagated to CodeMirror and back again to Automerge.
 */
export default class Mutex {
  private _locked
  get locked(): boolean
  lock(): void
  release(): void
}
