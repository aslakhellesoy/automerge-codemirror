import { storiesOf } from '@storybook/react'
import React, { useState } from 'react'
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/material.css'

import Automerge from 'automerge'
import './style.css'
import { Pad, PadComponent } from './components/PadComponent'
import { GetDoc, SetDoc } from '../src/types'

function makeUseDoc(initialDoc: Automerge.Doc<Pad>) {
  return function useDoc(): [GetDoc<Pad>, SetDoc<Pad>] {
    const [reactStateDoc, setReactStateDoc] = useState(initialDoc)
    let doc = reactStateDoc

    function hookGetDoc() {
      return doc
    }

    function hookSetDoc(newDoc: Automerge.Doc<Pad>) {
      setReactStateDoc(newDoc)
      doc = newDoc
    }

    return [hookGetDoc, hookSetDoc]
  }
}

storiesOf('Collaboration', module).add('Multiple CodeMirrors linked to a single Automerge doc', () => {
  const pad1 = Automerge.init<Pad>()
  const pad2 = Automerge.init<Pad>()
  return (
    <div>
      <PadComponent useDoc={makeUseDoc(pad1)} />
      <PadComponent useDoc={makeUseDoc(pad2)} />
    </div>
  )
})
