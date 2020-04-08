import { change, Text } from 'automerge'
import React, { FunctionComponent, useState } from 'react'
import AutomergeCodeMirror from '../../src/react/AutomergeCodeMirror'
import CodeMirror from 'codemirror'
import automergeCodeMirror from '../../src/automergeCodeMirror'

interface Pad {
  sheets: Text[]
}

interface Props {
  initialPad: Pad
}

const PadComponent: FunctionComponent<Props> = ({ initialPad }) => {
  const [pad, setPad] = useState(initialPad)

  const { connectCodeMirror } = automergeCodeMirror(initialPad)

  function createSheet() {
    setPad(
      change(pad, (draft) => {
        if (draft.sheets == undefined) draft.sheets = []
        draft.sheets.push(new Text())
      })
    )
  }

  function removeSheet() {
    setPad(
      change(pad, (draft) => {
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
    <div>
      <button onClick={createSheet}>New Sheet</button>
      <button onClick={removeSheet}>Remove Sheet</button>
      {(pad.sheets || []).map((_, i) => (
        <div key={i} style={{ border: 'solid', borderWidth: 1, margin: 4 }}>
          <AutomergeCodeMirror<Pad>
            makeCodeMirror={makeCodeMirror}
            connectCodeMirror={connectCodeMirror}
            setDoc={setPad}
            getDoc={() => pad}
            getText={(pad) => pad.sheets[i]}
          />
        </div>
      ))}
    </div>
  )
}

export { PadComponent, Pad }
