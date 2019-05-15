import React from 'react'
import { storiesOf } from '@storybook/react'
import { change, Connection, DocSet, init } from 'automerge'
import { DocSetWatchableDoc, Mutex, updateCodeMirrorDocs } from '..'
import Link from '../src/Link'
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/material.css'
import './style.css'
import { Pad, PadComponent } from './components/PadComponent'

function make(watchableDoc: DocSetWatchableDoc<Pad>) {
  const mutex = new Mutex()
  const links = new Set<Link<Pad>>()

  let doc = watchableDoc.get()
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

    const watchableDocA = new DocSetWatchableDoc<Pad>(docSetA, 'id')
    const watchableDocB = new DocSetWatchableDoc<Pad>(docSetB, 'id')

    const { links: linksA, mutex: mutexA } = make(watchableDocA)
    const { links: linksB, mutex: mutexB } = make(watchableDocB)

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
