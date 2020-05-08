import { storiesOf } from '@storybook/react'
import React from 'react'
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/material.css'

import './style.css'
import { Pad, PadComponent } from '../test/react/PadComponent'

import PeerDoc from '../test/manymerge/PeerDoc'
import HubDoc from '../test/manymerge/HubDoc'
import { Message } from '@cucumber/manymerge'
import AutomergeCodeMirror from '../src/AutomergeCodeMirror'
import { Change } from '../src/types'

storiesOf('Collaboration', module).add('Multiple CodeMirrors linked to a single Automerge doc', () => {
  const peerDocById = new Map<string, PeerDoc<Pad>>()

  const hubDoc = new HubDoc<Pad>(
    (peerId: string, msg: Message) => setTimeout(() => peerDocById.get(peerId)!.applyMessage(msg), 0),
    (msg: Message) =>
      Array.from(peerDocById.values()).forEach((peerDoc) => setTimeout(() => peerDoc.applyMessage(msg), 0))
  )

  const peerIds = ['Wilma', 'Fred', 'Barney']
  for (const peerId of peerIds) {
    peerDocById.set(
      peerId,
      new PeerDoc<Pad>((msg) => setTimeout(() => hubDoc.applyMessage(peerId, msg), 0))
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
          let timer: ReturnType<typeof setTimeout>
          const peerDoc = peerDocById.get(peerId)!
          const change: Change<Pad> = (changeFn) => {
            peerDoc.change(changeFn)
            clearTimeout(timer)
            timer = setTimeout(() => peerDoc.notify(), 5000)
          }
          return (
            <div key={peerId}>
              <h3>{peerId}</h3>
              <PadComponent peerDoc={peerDoc} automergeCodeMirror={new AutomergeCodeMirror<Pad>(change)} />
            </div>
          )
        })}
      </div>
    </div>
  )
})
