import { change, Text } from 'automerge'
import React, { FunctionComponent } from 'react'
import { Link, Mutex } from '../../src'
import AutomergeCodeMirror from '../../src/react/AutomergeCodeMirror'
import { UseDoc } from '../../src/react/UseDoc'

interface Pad {
  sheets: Text[]
}

interface Props {
  useDoc: UseDoc<Pad>
  mutex: Mutex
  links: Set<Link<Pad>>
}

const PadComponent: FunctionComponent<Props> = ({ useDoc, mutex, links }) => {
  const [getDoc, setDoc] = useDoc()

  function createSheet() {
    setDoc(
      change(getDoc(), (draft) => {
        if (draft.sheets == undefined) draft.sheets = []
        draft.sheets.push(new Text())
      })
    )
  }

  function removeSheet() {
    setDoc(
      change(getDoc(), (draft) => {
        if (draft.sheets) {
          draft.sheets.shift()
        }
      })
    )
  }

  return (
    <div>
      <button onClick={createSheet}>New Sheet</button>
      <button onClick={removeSheet}>Remove Sheet</button>
      {(getDoc().sheets || []).map((_, i) => (
        <div key={i} style={{ border: 'solid', borderWidth: 1, margin: 4 }}>
          <AutomergeCodeMirror<Pad>
            getDoc={getDoc}
            setDoc={setDoc}
            getText={(pad) => pad.sheets[i]}
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
