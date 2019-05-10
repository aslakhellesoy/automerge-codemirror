import React, { useEffect, useState } from 'react'
import { storiesOf } from '@storybook/react'
import { change, Connection, DocSet, init, Text, WatchableDoc } from 'automerge'
import {
  AutomergeCodeMirror,
  updateCodeMirrorDocs,
  DocSetWatchableDoc,
  Mutex,
} from '..'
import { Link } from '../src/types'
import { EditorConfiguration } from 'codemirror'
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/material.css'
import './style.css'

interface Pads {
  pads: Text[]
}

interface Props {
  watchableDoc: WatchableDoc<Pads>
  links: Set<Link<Pads>>
  mutex: Mutex
  name: string
}

const App: React.FunctionComponent<Props> = ({
  watchableDoc,
  links,
  mutex,
  name,
}) => {
  const [doc, setDoc] = useState(watchableDoc.get())

  useEffect(() => {
    watchableDoc.registerHandler(setDoc)
    return () => watchableDoc.unregisterHandler(setDoc)
  }, [])

  const editorConfiguration: EditorConfiguration = {
    viewportMargin: Infinity,
    lineWrapping: true,
    extraKeys: {
      Tab: false,
    },
  }
  const getAutomergeDoc = () => watchableDoc.get()
  const setAutomergeDoc = (doc: Pads) => watchableDoc.set(doc)

  const createPad = () => {
    watchableDoc.set(
      change(doc, mdoc => {
        if (mdoc.pads == undefined) mdoc.pads = []
        mdoc.pads.push(new Text())
      })
    )
  }

  return (
    <div>
      <button onClick={createPad}>New Pad</button>
      {((doc && doc.pads) || []).map((pad, i) => (
        <div key={i} style={{ border: 'solid', borderWidth: 1, margin: 4 }}>
          <AutomergeCodeMirror
            links={links}
            getAutomergeDoc={getAutomergeDoc}
            setAutomergeDoc={setAutomergeDoc}
            getText={doc => doc.pads[i]}
            editorConfiguration={editorConfiguration}
            mutex={mutex}
          />
        </div>
      ))}
    </div>
  )
}

function make(doc?: Pads) {
  const docSet = new DocSet<Pads>()
  const watchableDoc = new DocSetWatchableDoc<Pads>(docSet, 'id')

  if (doc) {
    watchableDoc.set(doc)
  }

  const mutex = new Mutex()
  const links = new Set<Link<Pads>>()
  watchableDoc.registerHandler(newDoc => {
    doc = updateCodeMirrorDocs(doc, newDoc, links, mutex)
  })

  return { docSet, watchableDoc, links, mutex }
}

storiesOf('Collaboration', module).add(
  'Multiple editors linked to a single Automerge doc',
  () => {
    const {
      docSet: docSetA,
      watchableDoc: watchableDocA,
      links: linksA,
      mutex: mutexA,
    } = make(change(init(), (mdoc: Pads) => (mdoc.pads = [])))
    const {
      docSet: docSetB,
      watchableDoc: watchableDocB,
      links: linksB,
      mutex: mutexB,
    } = make()

    let connectionA: Connection<Pads>
    let connectionB: Connection<Pads>

    connectionA = new Connection(docSetA, msg => {
      connectionB.receiveMsg(msg)
    })
    connectionB = new Connection(docSetB, msg => {
      connectionA.receiveMsg(msg)
    })

    connectionA.open()
    connectionB.open()

    return (
      <div>
        <App
          links={linksA}
          watchableDoc={watchableDocA}
          mutex={mutexA}
          name={'A'}
        />
        <App
          links={linksB}
          watchableDoc={watchableDocB}
          mutex={mutexB}
          name={'B'}
        />
      </div>
    )
  }
)
