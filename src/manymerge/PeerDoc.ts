import { Message, Peer } from 'manymerge'
import Automerge from 'automerge'

type Handler<T> = (oldDoc: Automerge.Doc<T>, newDoc: Automerge.Doc<T>) => void

export default class PeerDoc<T> {
  private readonly handlers = new Set<Handler<T>>()
  private readonly peer: Peer
  private _doc = Automerge.init<T>()

  get doc() {
    return this._doc
  }

  constructor(sendMsg: (msg: Message) => void) {
    this.peer = new Peer(sendMsg)
  }

  applyMessage(msg: Message) {
    const oldDoc = this._doc
    const newDoc = this.peer.applyMessage(msg, oldDoc)
    if (newDoc) {
      this._doc = newDoc
      for (const handler of this.handlers) {
        handler(oldDoc, newDoc)
      }
    }
  }

  change(changeFn: Automerge.ChangeFn<T>) {
    const oldDoc = this._doc
    this._doc = Automerge.change(this._doc, changeFn)
    for (const handler of this.handlers) {
      handler(oldDoc, this._doc)
    }
    this.peer.notify(this._doc)
  }

  subscribe(handler: Handler<T>) {
    this.handlers.add(handler)
    return () => {
      this.handlers.delete(handler)
    }
  }
}
