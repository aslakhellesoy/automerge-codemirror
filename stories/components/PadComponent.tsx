import Automerge from 'automerge'
import React, { FunctionComponent, useEffect, useState } from 'react'
import AutomergeCodeMirror from '../../src/react/AutomergeCodeMirror'
import CodeMirror from 'codemirror'
import PeerDoc from '../../src/manymerge/PeerDoc'
import connectAutomergeDoc from '../../src/connectAutomergeDoc'

interface Pad {
  sheets: Automerge.Text[]
}

interface Props {
  peerDoc: PeerDoc<Pad>
}

const PadComponent: FunctionComponent<Props> = ({ peerDoc }) => {
  const [doc, setDoc] = useState(peerDoc.doc)
  const { connectCodeMirror, updateCodeMirrors } = connectAutomergeDoc(doc, (newDoc) => peerDoc.notify(newDoc))

  useEffect(() => {
    return peerDoc.subscribe((newDoc) => {
      setDoc(newDoc)
      updateCodeMirrors(newDoc)
    })
  }, [])

  function createSheet() {
    const newDoc = Automerge.change(doc, (proxy) => {
      if (proxy.sheets == undefined) proxy.sheets = []
      proxy.sheets.push(new Automerge.Text())
    })
    setDoc(newDoc)
    peerDoc.notify(newDoc)
  }

  function removeSheet() {
    const newDoc = Automerge.change(doc, (proxy) => {
      if (proxy.sheets) {
        proxy.sheets.shift()
      }
    })
    setDoc(newDoc)
    peerDoc.notify(newDoc)
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
