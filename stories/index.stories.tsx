import { storiesOf } from '@storybook/react'
import React from 'react'
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/material.css'

import './style.css'
import { Pad, PadComponent } from './components/PadComponent'

import PeerDoc from '../src/manymerge/PeerDoc'
import HubDoc from '../src/manymerge/HubDoc'
import { Message } from 'manymerge'
import AutomergeCodeMirror from '../src/AutomergeCodeMirror'

storiesOf('Collaboration', module).add('Multiple CodeMirrors linked to a single Automerge doc', () => {
  const peerDocById = new Map<string, PeerDoc<Pad>>()

  const hubDoc = new HubDoc<Pad>(
    (peerId: string, msg: Message) => peerDocById.get(peerId)!.applyMessage(msg),
    (msg: Message) => Array.from(peerDocById.values()).forEach((peerDoc) => peerDoc.applyMessage(msg))
  )

  const peerIds = ['Wilma', 'Fred', 'Barney']
  for (const peerId of peerIds) {
    peerDocById.set(
      peerId,
      new PeerDoc<Pad>((msg) => hubDoc.applyMessage(peerId, msg))
    )
  }

  return (
    <div>
      <p>
        Below are three actors - Wilma, Fred and Barney. They each have a Pad with sheets. Each sheet is connected to a
        CodeMirror editor.
      </p>
      <p>
        The source code is at
        <a href="https://github.com/aslakhellesoy/automerge-codemirror/blob/master/stories/index.stories.tsx">here</a>.
      </p>
      <div className="pads">
        {peerIds.map((peerId) => {
          const peerDoc = peerDocById.get(peerId)!
          const notify = peerDoc.notify.bind(peerDoc)
          return (
            <div key={peerId}>
              <h3>Wilma</h3>
              <PadComponent peerDoc={peerDoc} automergeCodeMirror={new AutomergeCodeMirror<Pad>(notify)} />
            </div>
          )
        })}
      </div>
    </div>
  )
})
