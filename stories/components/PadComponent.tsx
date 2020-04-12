import Automerge from 'automerge'
import React, { FunctionComponent } from 'react'
import AutomergeCodeMirror from '../../src/react/AutomergeCodeMirror'
import CodeMirror from 'codemirror'
import useAutomergeDoc from '../../src/react/useAutomergeDoc'
import { ConnectCodeMirror } from '../../src/types'

interface Pad {
  sheets: Automerge.Text[]
}

interface Props {
  watchableDoc: Automerge.WatchableDoc<Pad>
  connectCodeMirror: ConnectCodeMirror<Pad>
}

const PadComponent: FunctionComponent<Props> = ({ watchableDoc, connectCodeMirror }) => {
  const doc = useAutomergeDoc(watchableDoc)

  function createSheet() {
    watchableDoc.set(
      Automerge.change(watchableDoc.get(), (draft) => {
        if (draft.sheets == undefined) draft.sheets = []
        draft.sheets.push(new Automerge.Text())
      })
    )
  }

  function removeSheet() {
    watchableDoc.set(
      Automerge.change(watchableDoc.get(), (draft) => {
        if (draft.sheets) {
          draft.sheets.shift()
        }
      })
    )
  }

  function makeCodeMirror(element: HTMLElement): CodeMirror.Editor {
    return CodeMirror(element, {
      viewportMargin: Infinity,
      lineWrapping: true,
      extraKeys: {
        Tab: false,
      },
    })
  }

  return (
    <div className="pad">
      <button onClick={createSheet}>New Sheet</button>
      <button onClick={removeSheet}>Remove Sheet</button>
      {(doc.sheets || []).map((_, i) => {
        function getText(doc: Pad | Automerge.Proxy<Pad>) {
          return doc.sheets[i]
        }
        return (
          <div key={i} style={{ border: 'solid', borderWidth: 1, margin: 4 }}>
            <AutomergeCodeMirror<Pad>
              makeCodeMirror={makeCodeMirror}
              connectCodeMirror={connectCodeMirror}
              getText={getText}
            />
          </div>
        )
      })}
    </div>
  )
}

export { PadComponent, Pad }
