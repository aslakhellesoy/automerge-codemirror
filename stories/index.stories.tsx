import { storiesOf } from '@storybook/react'
import React from 'react'
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/material.css'

import { change, Connection, DocSet, init, WatchableDoc } from 'automerge'
import { DocSetWatchableDoc, Link, Mutex } from '../src'
import './style.css'
import { Pad, PadComponent } from './components/PadComponent'
import { GridComponent, Sheet } from './components/GridComponent'

storiesOf('Collaboration', module).add(
  'Multiple CodeMirrors linked to a single Automerge doc',
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

storiesOf('Collaboration', module).add(
  'Grid linked to a single Automerge doc',
  () => {
    const watchableDocs = createConnectedDocs<Sheet>(2, 'someid')
    watchableDocs[0].set(
      change(
        init(),
        (draft: Sheet) =>
          (draft.grid = [
            [{ value: 'A' }, { value: 'BBB' }],
            [{ value: 'CCC' }, { value: 'DDD' }],
          ])
      )
    )

    return (
      <div>
        {watchableDocs.map((watchableDoc, n) => (
          <GridComponent key={n} watchableDoc={watchableDoc} />
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
