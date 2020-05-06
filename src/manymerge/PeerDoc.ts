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

  notify(newDoc: Automerge.Doc<T>) {
    this.peer.notify(newDoc)
  }

  subscribe(handler: Handler<T>) {
    this.handlers.add(handler)
    return () => {
      this.handlers.delete(handler)
    }
  }
}
