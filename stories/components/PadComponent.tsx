import Automerge from 'automerge'
import React, { FunctionComponent } from 'react'
import AutomergeCodeMirror from '../../src/react/AutomergeCodeMirror'
import CodeMirror from 'codemirror'
import { ConnectCodeMirror, GetCurrentDoc, SetReactState } from '../../src/types'

interface Pad {
  sheets: Automerge.Text[]
}

interface Props {
  useAutomergeCodeMirror: () => [GetCurrentDoc<Pad>, SetReactState<Pad>, ConnectCodeMirror<Pad>]
}

const PadComponent: FunctionComponent<Props> = ({ useAutomergeCodeMirror }) => {
  const [getCurrentDoc, setDoc, connectCodeMirror] = useAutomergeCodeMirror()

  function createSheet() {
    setDoc(
      Automerge.change(getCurrentDoc(), (draft) => {
        if (draft.sheets == undefined) draft.sheets = []
        draft.sheets.push(new Automerge.Text())
      })
    )
  }

  function removeSheet() {
    setDoc(
      Automerge.change(getCurrentDoc(), (draft) => {
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
      {(getCurrentDoc().sheets || []).map((_, i) => {
        function getText(doc: Pad | Automerge.Proxy<Pad>) {
          return doc.sheets[i]
        }
        return (
          <div key={i} style={{ border: 'solid', borderWidth: 1, margin: 4 }}>
            <AutomergeCodeMirror<Pad>
              makeCodeMirror={makeCodeMirror}
              connectCodeMirror={connectCodeMirror}
              getCurrentDoc={getCurrentDoc}
              setDoc={setDoc}
              getText={getText}
            />
          </div>
        )
      })}
    </div>
  )
}

export { PadComponent, Pad }
