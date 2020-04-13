import { storiesOf } from '@storybook/react'
import React from 'react'
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/material.css'

import Automerge from 'automerge'
import './style.css'
import { Pad, PadComponent } from './components/PadComponent'
import connectAutomergeDoc from '../src/connectAutomergeDoc'

storiesOf('Collaboration', module).add('Multiple CodeMirrors linked to a single Automerge doc', () => {
  const watchableDocWilma = new Automerge.WatchableDoc(Automerge.init<Pad>())
  const watchableDocFred = new Automerge.WatchableDoc(Automerge.init<Pad>())
  const watchableDocBarney = new Automerge.WatchableDoc(Automerge.init<Pad>())

  connect(watchableDocWilma, watchableDocFred)
  connect(watchableDocFred, watchableDocBarney)

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
          <PadComponent watchableDoc={watchableDocWilma} connectCodeMirror={connectAutomergeDoc(watchableDocWilma)} />
        </div>
        <div>
          <h3>Fred</h3>
          <PadComponent watchableDoc={watchableDocFred} connectCodeMirror={connectAutomergeDoc(watchableDocFred)} />
        </div>
        <div>
          <h3>Barney</h3>
          <PadComponent watchableDoc={watchableDocBarney} connectCodeMirror={connectAutomergeDoc(watchableDocBarney)} />
        </div>
      </div>
    </div>
  )
})

function connect<D>(watchableDocA: Automerge.WatchableDoc<D>, watchableDocB: Automerge.WatchableDoc<D>) {
  watchableDocA.registerHandler(() =>
    setIfDifferent(watchableDocB, Automerge.merge(watchableDocB.get(), watchableDocA.get()))
  )
  watchableDocB.registerHandler(() =>
    setIfDifferent(watchableDocA, Automerge.merge(watchableDocA.get(), watchableDocB.get()))
  )
}

function setIfDifferent<D>(watchableDoc: Automerge.WatchableDoc<D>, doc: D) {
  if (watchableDoc.get() !== doc) {
    watchableDoc.set(doc)
  }
}
