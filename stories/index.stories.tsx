import { storiesOf } from '@storybook/react'
import React from 'react'
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/material.css'

import { change, Connection, DocSet, init, WatchableDoc } from 'automerge'
import { DocSetWatchableDoc, Mutex, Link } from '../src'
import './style.css'
import { Pad, PadComponent } from './components/PadComponent'

storiesOf('Collaboration', module).add(
  'Multiple editors linked to a single Automerge doc',
  () => {
    const watchableDocs = createConnectedDocs<Pad>(3, 'someid')

    watchableDocs[0].set(change(init(), (draft: Pad) => (draft.sheets = [])))

    return (
      <div>
        {watchableDocs.map((watchableDoc, n) => (
          <PadComponent
            key={n}
            watchableDoc={watchableDoc}
            mutex={new Mutex()}
            links={new Set<Link<Pad>>()}
          />
        ))}
      </div>
    )
  }
)

function createConnectedDocs<T>(count: number, id: string): WatchableDoc<T>[] {
  const docSets: DocSet<T>[] = []
  for (let i = 0; i < count; i++) {
    const docSet = new DocSet<T>()
    docSets.push(docSet)

    if (i > 0) {
      let connectionA: Connection<T>
      let connectionB: Connection<T>

      connectionA = new Connection(docSet, msg => connectionB.receiveMsg(msg))
      connectionB = new Connection(docSets[i - 1], msg =>
        connectionA.receiveMsg(msg)
      )

      connectionA.open()
      connectionB.open()
    }
  }
  return docSets.map(docSet => new DocSetWatchableDoc(docSet, id))
}
