import { change, Text, WatchableDoc } from 'automerge'
import React, { FunctionComponent } from 'react'
import {
  AutomergeCodeMirror,
  Link,
  Mutex,
  useAutomergeDoc,
  useCodeMirrorUpdater,
} from '../../src'

interface Pad {
  sheets: Text[]
}

interface Props {
  watchableDoc: WatchableDoc<Pad>
  mutex: Mutex
  links: Set<Link<Pad>>
}

const PadComponent: FunctionComponent<Props> = ({
  watchableDoc,
  mutex,
  links,
}) => {
  const doc = useAutomergeDoc(watchableDoc)
  useCodeMirrorUpdater(watchableDoc, mutex, links)

  function createSheet() {
    watchableDoc.set(
      change(doc, draft => {
        if (draft.sheets == undefined) draft.sheets = []
        draft.sheets.push(new Text())
      })
    )
  }

  return (
    <div>
      <button onClick={createSheet}>New Sheet</button>
      {((doc && doc.sheets) || []).map((pad, i) => (
        <div key={i} style={{ border: 'solid', borderWidth: 1, margin: 4 }}>
          <AutomergeCodeMirror
            watchableDoc={watchableDoc}
            getText={doc => doc.sheets[i]}
            links={links}
            mutex={mutex}
            editorConfiguration={{
              viewportMargin: Infinity,
              lineWrapping: true,
              extraKeys: {
                Tab: false,
              },
            }}
          />
        </div>
      ))}
    </div>
  )
}

export { PadComponent, Pad }
