import { storiesOf } from '@storybook/react'
import React from 'react'
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/material.css'

import './style.css'
import { Pad, PadComponent } from './components/PadComponent'

import PeerDoc from '../src/manymerge/PeerDoc'

storiesOf('Collaboration', module).add('Multiple CodeMirrors linked to a single Automerge doc', () => {
  let wilmasPeerDoc: PeerDoc<Pad>
  let fredsPeerDoc: PeerDoc<Pad>
  let barneysPeerDoc: PeerDoc<Pad>

  wilmasPeerDoc = new PeerDoc<Pad>((msg) => fredsPeerDoc.applyMessage(msg))
  fredsPeerDoc = new PeerDoc<Pad>((msg) => barneysPeerDoc.applyMessage(msg))
  barneysPeerDoc = new PeerDoc<Pad>((msg) => wilmasPeerDoc.applyMessage(msg))

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
          <PadComponent peerDoc={wilmasPeerDoc} />
        </div>
        <div>
          <h3>Fred</h3>
          <PadComponent peerDoc={fredsPeerDoc} />
        </div>
        <div>
          <h3>Barney</h3>
          <PadComponent peerDoc={barneysPeerDoc} />
        </div>
      </div>
    </div>
  )
})
