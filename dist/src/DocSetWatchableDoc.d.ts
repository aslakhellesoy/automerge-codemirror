import { Change, DocSet, WatchableDoc } from 'automerge'
declare type Handler<Doc> = (doc: Doc) => void
/**
 * Implements the API of Automerge.WatchableDoc, but backed by an Automerge.DocSet.
 * The motivation behind this is to use Automerge.Connection (which
 * only works with Automerge.DocSet, and not Automerge.WatchableDoc). Another
 * approach could have been to implement a WatchableDocConnection, but that
 * is a lot more work
 */
export default class DocSetWatchableDoc<T> implements WatchableDoc<T> {
  readonly docSet: DocSet<T>
  readonly docId: string
  private handlers
  constructor(docSet: DocSet<T>, docId: string)
  get(): T
  set(doc: T): void
  applyChanges(changes: Change<T>[]): T
  registerHandler(handler: Handler<T>): void
  unregisterHandler(handler: Handler<T>): void
}
export {}
