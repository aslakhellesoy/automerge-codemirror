import Automerge from 'automerge'
import React, { FunctionComponent, useState } from 'react'
import AutomergeCodeMirror from '../../src/react/AutomergeCodeMirror'
import CodeMirror from 'codemirror'
import { ConnectCodeMirror, Notify } from '../../src/types'

interface Pad {
  sheets: Automerge.Text[]
}

interface Props {
  initialDoc: Automerge.Doc<Pad>
  connectCodeMirror: ConnectCodeMirror<Pad>
  notify: Notify<Pad>
}

const PadComponent: FunctionComponent<Props> = ({ initialDoc, connectCodeMirror, notify }) => {
  const [doc, setDoc] = useState(initialDoc)

  function createSheet() {
    const newDoc = Automerge.change(doc, (proxy) => {
      if (proxy.sheets == undefined) proxy.sheets = []
      proxy.sheets.push(new Automerge.Text())
    })
    setDoc(newDoc)
    notify(newDoc)
  }

  function removeSheet() {
    const newDoc = Automerge.change(doc, (proxy) => {
      if (proxy.sheets) {
        proxy.sheets.shift()
      }
    })
    setDoc(newDoc)
    notify(newDoc)
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
          <div key={i} className="sheet">
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
