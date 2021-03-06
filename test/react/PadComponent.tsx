import Automerge from 'automerge'
import React, { FunctionComponent, useEffect, useState } from 'react'
import CodeMirror from 'codemirror'
import PeerDoc from '../../test/manymerge/PeerDoc'
import AutomergeCodeMirror from '../../src/AutomergeCodeMirror'
import AutomergeCodeMirrorComponent from '../../src/react/AutomergeCodeMirrorComponent'

interface Pad {
  sheets: Automerge.Text[]
}

interface Props {
  peerDoc: PeerDoc<Pad>
  automergeCodeMirror: AutomergeCodeMirror<Pad>
}

const PadComponent: FunctionComponent<Props> = ({ peerDoc, automergeCodeMirror }) => {
  const [doc, setDoc] = useState(peerDoc.doc)

  useEffect(() => {
    return peerDoc.subscribe((oldDoc, newDoc) => {
      automergeCodeMirror.updateCodeMirrors(oldDoc, newDoc)
      setDoc(newDoc)
    })
  }, [])

  function createSheet() {
    peerDoc.change((proxy) => {
      if (proxy.sheets == undefined) proxy.sheets = []
      proxy.sheets.push(new Automerge.Text())
    })

    peerDoc.notify()
  }

  function removeSheet() {
    peerDoc.change((proxy) => {
      if (proxy.sheets) {
        proxy.sheets.shift()
      }
    })

    peerDoc.notify()
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
            <AutomergeCodeMirrorComponent<Pad>
              doc={doc}
              makeCodeMirror={makeCodeMirror}
              automergeCodeMirror={automergeCodeMirror}
              getText={getText}
            />
          </div>
        )
      })}
    </div>
  )
}

export { PadComponent, Pad }
