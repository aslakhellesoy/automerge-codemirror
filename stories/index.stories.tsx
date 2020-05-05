import { storiesOf } from '@storybook/react'
import Automerge from 'automerge'
import React from 'react'
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/material.css'

import './style.css'
import { Pad, PadComponent } from './components/PadComponent'

import { Message, Peer } from 'manymerge'

class PeerDoc<T> {
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

storiesOf('Collaboration', module).add('Multiple CodeMirrors linked to a single Automerge doc', () => {
  let wilmasPeerDoc: PeerDoc<Pad> | undefined
  let fredsPeerDoc: PeerDoc<Pad> | undefined
  let barneysPeerDoc: PeerDoc<Pad> | undefined

  const sendMsgWilma = (msg: Message) => {
    if (wilmasPeerDoc) wilmasPeerDoc.applyMessage(msg)
  }
  let sendMsgFred = (msg: Message) => {
    if (fredsPeerDoc) fredsPeerDoc.applyMessage(msg)
  }
  let sendMsgBarney = (msg: Message) => {
    if (barneysPeerDoc) barneysPeerDoc.applyMessage(msg)
  }

  return (
    <div>
      <p>
        Below are three actors - Wilma, Fred and Barney. They each have a Pad with sheets. Each sheet is connected to a
        CodeMirror editor.
      </p>
      <p>
        Wilma and Fred's pads are connected. Fred and Barney's pads are also connected. When either of them creates a
        new pad or edits a sheet in a pad, changes are reflected in the other's pads and sheets.
      </p>
      <p>
        The source code is{' '}
        <a href="https://github.com/aslakhellesoy/automerge-codemirror/blob/master/stories/index.stories.tsx">here</a>.
      </p>
      <div className="pads">
        <div>
          <h3>Wilma</h3>
          <PadComponent
            sendMsg={sendMsgWilma}
            subscribe={(peer, setDoc) => (wilmasPeerDoc = peer)}
            connectCodeMirror={connectCodeMirrorWilma}
            notify={notifyWilma}
          />
        </div>
        <div>
          <h3>Fred</h3>
          <PadComponent sendMsg={sendMsgFred} connectCodeMirror={connectCodeMirrorFred} notify={notifyFred} />
        </div>
        <div>
          <h3>Barney</h3>
          <PadComponent sendMsg={sendMsgBarney} connectCodeMirror={connectCodeMirrorBarney} notify={notifyBarney} />
        </div>
      </div>
    </div>
  )
})
