import { storiesOf } from '@storybook/react'
import React, { useState } from 'react'
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/material.css'

import Automerge from 'automerge'
import './style.css'
import { Pad, PadComponent } from './components/PadComponent'

import { Message, Peer } from 'manymerge'
import connectAutomergeDoc from '../src/connectAutomergeDoc'

storiesOf('Collaboration', module).add('Multiple CodeMirrors linked to a single Automerge doc', () => {
  const [docWilma, setDocWilma] = useState(Automerge.init<Pad>())
  const [docFred, setDocFred] = useState(Automerge.init<Pad>())
  const [docBarney, setDocBarney] = useState(Automerge.init<Pad>())

  let peerWilma: Peer
  let peerFred: Peer
  let peerBarney: Peer

  const sendMsgToFred = (msg: Message) => {
    const newDoc = peerFred.applyMessage(msg, docFred)

    if (newDoc) {
      updateCodeMirrorsFred(newDoc)
      setDocFred(newDoc)
    }
  }

  const sendMsgToBarney = (msg: Message) => {
    const newDoc = peerBarney.applyMessage(msg, docBarney)

    if (newDoc) {
      updateCodeMirrorsBarney(newDoc)
      setDocBarney(newDoc)
    }
  }

  const sendMsgToWilma = (msg: Message) => {
    const newDoc = peerWilma.applyMessage(msg, docWilma)

    if (newDoc) {
      updateCodeMirrorsWilma(newDoc)
      setDocWilma(newDoc)
    }
  }

  const notifyWilma = peerWilma.notify.bind(peerWilma)
  const notifyFred = peerFred.notify.bind(peerFred)
  const notifyBarney = peerBarney.notify.bind(peerBarney)

  const { connectCodeMirror: connectCodeMirrorWilma, updateCodeMirrors: updateCodeMirrorsWilma } = connectAutomergeDoc(
    docWilma,
    notifyWilma
  )
  const { connectCodeMirror: connectCodeMirrorFred, updateCodeMirrors: updateCodeMirrorsFred } = connectAutomergeDoc(
    docFred,
    notifyFred
  )
  const {
    connectCodeMirror: connectCodeMirrorBarney,
    updateCodeMirrors: updateCodeMirrorsBarney,
  } = connectAutomergeDoc(docBarney, notifyBarney)

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
            initialDoc={docWilma}
            sendMsg={sendMsgToFred}
            connectCodeMirror={connectCodeMirrorWilma}
            notify={notifyWilma}
          />
        </div>
        <div>
          <h3>Fred</h3>
          <PadComponent
            initialDoc={docFred}
            sendMsg={sendMsgToBarney}
            connectCodeMirror={connectCodeMirrorFred}
            notify={notifyFred}
          />
        </div>
        <div>
          <h3>Barney</h3>
          <PadComponent
            initialDoc={docBarney}
            sendMsg={sendMsgToWilma}
            connectCodeMirror={connectCodeMirrorBarney}
            notify={notifyBarney}
          />
        </div>
      </div>
    </div>
  )
})
