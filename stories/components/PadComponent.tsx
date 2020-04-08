import Automerge from 'automerge'
import React, { FunctionComponent } from 'react'
import AutomergeCodeMirror from '../../src/react/AutomergeCodeMirror'
import CodeMirror from 'codemirror'
import { ConnectCodeMirror, GetDoc, SetDoc } from '../../src/types'

interface Pad {
  sheets: Automerge.Text[]
}

interface Props {
  useDoc: () => [GetDoc<Pad>, SetDoc<Pad>, ConnectCodeMirror<Pad>]
}

const PadComponent: FunctionComponent<Props> = ({ useDoc }) => {
  const [getDoc, setDoc, connectCodeMirror] = useDoc()

  function createSheet() {
    setDoc(
      Automerge.change(getDoc(), (draft) => {
        if (draft.sheets == undefined) draft.sheets = []
        draft.sheets.push(new Automerge.Text())
      })
    )
  }

  function removeSheet() {
    setDoc(
      Automerge.change(getDoc(), (draft) => {
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
      {(getDoc().sheets || []).map((_, i) => {
        function getText(doc: Pad | Automerge.Proxy<Pad>) {
          return doc.sheets[i]
        }
        return (
          <div key={i} style={{ border: 'solid', borderWidth: 1, margin: 4 }}>
            <AutomergeCodeMirror<Pad>
              makeCodeMirror={makeCodeMirror}
              connectCodeMirror={connectCodeMirror}
              setDoc={setDoc}
              getDoc={getDoc}
              getText={getText}
            />
          </div>
        )
      })}
    </div>
  )
}

export { PadComponent, Pad }
