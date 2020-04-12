import Automerge from 'automerge'
import React, { FunctionComponent } from 'react'
import AutomergeCodeMirror from '../../src/react/AutomergeCodeMirror'
import CodeMirror from 'codemirror'
import useAutomergeCodeMirror from '../../src/react/useAutomergeCodeMirror'

interface Pad {
  sheets: Automerge.Text[]
}

interface Props {
  watchableDoc: Automerge.WatchableDoc<Pad>
  name: string
}

const PadComponent: FunctionComponent<Props> = ({ watchableDoc }) => {
  const [doc, connectCodeMirror] = useAutomergeCodeMirror(watchableDoc)

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
              watchableDoc={watchableDoc}
              getText={getText}
            />
          </div>
        )
      })}
    </div>
  )
}

export { PadComponent, Pad }
