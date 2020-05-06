import { Message, Hub } from 'manymerge'
import Automerge from 'automerge'

export default class HubDoc<T> {
  private readonly hub: Hub
  private _doc = Automerge.init<T>()

  constructor(sendMsgTo: (peerId: string, msg: Message) => void, broadcastMsg: (msg: Message) => void) {
    this.hub = new Hub(sendMsgTo, broadcastMsg)
  }

  applyMessage(peerId: string, msg: Message) {
    const newDoc = this.hub.applyMessage(peerId, msg, this._doc)
    if (newDoc) {
      this._doc = newDoc
    }
  }
}
