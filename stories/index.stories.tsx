import React, { useEffect, useState } from 'react'
import { storiesOf } from '@storybook/react'
import { change, DocSet, init, Text, WatchableDoc } from 'automerge'
import AutomergeCodeMirror from '../src/AutomergeCodeMirror'
import updateCodeMirrorDocs from '../src/updateCodeMirrorDocs'
import { Link } from '../src/types'
import { EditorConfiguration } from 'codemirror'
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/material.css'
import './style.css'
import DocSetWatchableDoc from '../src/DocSetWatchableDoc'
import Mutex from '../src/Mutex'

interface Pads {
  pads: Text[]
}

interface Props {
  watchableDoc: WatchableDoc<Pads>
  links: Set<Link<Pads>>
  mutex: Mutex
}

const App: React.FunctionComponent<Props> = ({
  watchableDoc,
  links,
  mutex,
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
  return (
    <div>
      {(doc.pads || []).map((pad, i) => (
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

storiesOf('Collaboration', module).add(
  'Multiple editors linked to a single Automerge doc',
  () => {
    const docSet = new DocSet<Pads>()
    const watchableDoc = new DocSetWatchableDoc<Pads>(docSet, 'id')
    const links = new Set<Link<Pads>>()

    let doc: Pads = init()
    watchableDoc.set(doc)

    const mutex = new Mutex()

    watchableDoc.registerHandler(newDoc => {
      doc = updateCodeMirrorDocs(doc, newDoc, links, mutex)
    })

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
        <App links={links} watchableDoc={watchableDoc} mutex={mutex} />
      </div>
    )
  }
)
