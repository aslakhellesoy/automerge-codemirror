import { Message, Peer } from 'manymerge'
import Automerge from 'automerge'

type Handler<T> = (newDoc: Automerge.Doc<T>) => void

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
    const newDoc = this.peer.applyMessage(msg, this._doc)
    if (newDoc) {
      this._doc = newDoc
      for (const handler of this.handlers) {
        handler(newDoc)
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
