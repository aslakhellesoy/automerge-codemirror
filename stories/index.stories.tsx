import { storiesOf } from '@storybook/react'
import React from 'react'
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/material.css'

import { change, Connection, DocSet, init } from 'automerge'
import { DocSetWatchableDoc, Mutex, Link } from '..'
import './style.css'
import { Pad, PadComponent } from './components/PadComponent'

storiesOf('Collaboration', module).add(
  'Multiple editors linked to a single Automerge doc',
  () => {
    const docSetA = new DocSet<Pad>()
    const docSetB = new DocSet<Pad>()

    const watchableDocA = new DocSetWatchableDoc<Pad>(docSetA, 'id')
    const watchableDocB = new DocSetWatchableDoc<Pad>(docSetB, 'id')

    let connectionA: Connection<Pad>
    let connectionB: Connection<Pad>

    connectionA = new Connection(docSetA, msg => connectionB.receiveMsg(msg))
    connectionB = new Connection(docSetB, msg => connectionA.receiveMsg(msg))

    connectionA.open()
    connectionB.open()

    watchableDocA.set(change(init(), (draft: Pad) => (draft.sheets = [])))

    return (
      <div>
        <PadComponent
          watchableDoc={watchableDocA}
          mutex={new Mutex()}
          links={new Set<Link<Pad>>()}
        />
        <PadComponent
          watchableDoc={watchableDocB}
          mutex={new Mutex()}
          links={new Set<Link<Pad>>()}
        />
      </div>
    )
  }
)
