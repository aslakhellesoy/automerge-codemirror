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
  peerId: string
  peerDoc: PeerDoc<Pad>
}

const PadComponent: FunctionComponent<Props> = ({ peerId, peerDoc }) => {
  const [doc, setDoc] = useState(peerDoc.doc)
  const { connectCodeMirror, updateCodeMirrors } = connectAutomergeDoc<Pad>((newDoc) => {
    console.log('NEW DOC', peerId, newDoc.sheets[0].toString())
    setDoc(newDoc)
    peerDoc.notify(newDoc)
  })

  useEffect(() => {
    return peerDoc.subscribe((newDoc) => {
      console.log('delivery!', peerId)
      setDoc(newDoc)
      updateCodeMirrors(doc, newDoc)
    })
  }, [])

  function createSheet() {
    const newDoc = Automerge.change(doc, (proxy) => {
      if (proxy.sheets == undefined) proxy.sheets = []
      proxy.sheets.push(new Automerge.Text(String(proxy.sheets.length)))
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
              doc={doc}
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
