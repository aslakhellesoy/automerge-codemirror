import { Message, Peer } from 'manymerge'
import Automerge from 'automerge'

export default class PeerDoc<T> {
  private readonly peer: Peer
  private doc = Automerge.init<T>()

  constructor(sendMsg: (msg: Message) => void) {
    this.peer = new Peer(sendMsg)
  }

  applyMessage(msg: Message) {
    const newDoc = this.peer.applyMessage(msg, this.doc)
    if (newDoc) {
      this.doc = newDoc
    }
  }
}
