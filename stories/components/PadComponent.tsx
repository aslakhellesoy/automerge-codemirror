import { Link } from '../../src/types'
import { AutomergeCodeMirror, Mutex } from '../../index'
import React, { useEffect, useState } from 'react'
import { EditorConfiguration } from 'codemirror'
import { change, Text, WatchableDoc } from 'automerge'

interface Pad {
  sheets: Text[]
}

interface Props {
  watchableDoc: WatchableDoc<Pad>
  links: Set<Link<Pad>>
  mutex: Mutex
}

const PadComponent: React.FunctionComponent<Props> = ({
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
  const setAutomergeDoc = (doc: Pad) => watchableDoc.set(doc)

  const createPad = () => {
    watchableDoc.set(
      change(doc, draft => {
        if (draft.sheets == undefined) draft.sheets = []
        draft.sheets.push(new Text())
      })
    )
  }

  return (
    <div>
      <button onClick={createPad}>New Pad</button>
      {((doc && doc.sheets) || []).map((pad, i) => (
        <div key={i} style={{ border: 'solid', borderWidth: 1, margin: 4 }}>
          <AutomergeCodeMirror
            getAutomergeDoc={getAutomergeDoc}
            setAutomergeDoc={setAutomergeDoc}
            getText={doc => doc.sheets[i]}
            links={links}
            mutex={mutex}
            editorConfiguration={editorConfiguration}
          />
        </div>
      ))}
    </div>
  )
}

export { PadComponent, Pad }
