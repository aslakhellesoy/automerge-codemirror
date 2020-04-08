import { storiesOf } from '@storybook/react'
import React, { useState } from 'react'
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/material.css'

import Automerge from 'automerge'
import './style.css'
import { Pad, PadComponent } from './components/PadComponent'
import { ConnectCodeMirror, GetDoc, SetDoc } from '../src/types'
import automergeCodeMirror from '../src/automergeCodeMirror'

function makeUseDoc(initialDoc: Automerge.Doc<Pad>): () => [GetDoc<Pad>, SetDoc<Pad>, ConnectCodeMirror<Pad>] {
  const { connectCodeMirror, updateCodeMirrors } = automergeCodeMirror(initialDoc)

  return function useDoc() {
    const [reactStateDoc, setReactStateDoc] = useState(initialDoc)
    let doc = reactStateDoc

    function hookGetDoc() {
      return doc
    }

    function hookSetDoc(newDoc: Automerge.Doc<Pad>) {
      setReactStateDoc(newDoc)
      updateCodeMirrors(newDoc)
      doc = newDoc
    }

    return [hookGetDoc, hookSetDoc, connectCodeMirror]
  }
}

storiesOf('Collaboration', module).add('Multiple CodeMirrors linked to a single Automerge doc', () => {
  const [getDoc1, setDoc1, connectCodeMirror1] = makeUseDoc(Automerge.init<Pad>())()
  const [getDoc2, setDoc2, connectCodeMirror2] = makeUseDoc(Automerge.init<Pad>())()

  function setDoc1Sync(newDoc: Automerge.Doc<Pad>) {
    setDoc1(newDoc)
    const newDoc2 = Automerge.merge(getDoc2(), newDoc)
    setDoc2(newDoc2)
  }

  function setDoc2Sync(newDoc: Automerge.Doc<Pad>) {
    setDoc2(newDoc)
    const newDoc1 = Automerge.merge(getDoc1(), newDoc)
    setDoc1(newDoc1)
  }

  return (
    <div>
      <PadComponent useDoc={() => [getDoc1, setDoc1Sync, connectCodeMirror1]} />
      <PadComponent useDoc={() => [getDoc2, setDoc2Sync, connectCodeMirror2]} />
    </div>
  )
})
