import React from 'react'
import { storiesOf } from '@storybook/react'
import { change, Connection, DocSet, init } from 'automerge'
import { DocSetWatchableDoc, Mutex, updateCodeMirrorDocs } from '..'
import Link from '../src/Link'
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/material.css'
import './style.css'
import { Pad, PadComponent } from './components/PadComponent'

function make(docSet: DocSet<Pad>, doc?: Pad) {
  const watchableDoc = new DocSetWatchableDoc<Pad>(docSet, 'id')
  const mutex = new Mutex()
  const links = new Set<Link<Pad>>()
  watchableDoc.registerHandler(newDoc => {
    doc = updateCodeMirrorDocs(doc, newDoc, links, mutex)
  })

  return { watchableDoc, links, mutex }
}

storiesOf('Collaboration', module).add(
  'Multiple editors linked to a single Automerge doc',
  () => {
    const docSetA = new DocSet<Pad>()
    const docSetB = new DocSet<Pad>()

    const { watchableDoc: watchableDocA, links: linksA, mutex: mutexA } = make(
      docSetA
    )

    const { watchableDoc: watchableDocB, links: linksB, mutex: mutexB } = make(
      docSetB
    )

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
          links={linksA}
          watchableDoc={watchableDocA}
          mutex={mutexA}
        />
        <PadComponent
          links={linksB}
          watchableDoc={watchableDocB}
          mutex={mutexB}
        />
      </div>
    )
  }
)