import { storiesOf } from '@storybook/react'
import React, { useState } from 'react'
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/material.css'

import Automerge from 'automerge'
import './style.css'
import { Pad, PadComponent } from './components/PadComponent'
import { ConnectCodeMirror, GetCurrentDoc, SetCurrentDoc, SetDoc } from '../src/types'
import automergeCodeMirror from '../src/automergeCodeMirror'

function makeUseAutomergeCodeMirror(
  getCurrentDoc: GetCurrentDoc<Pad>,
  setCurrentDoc: SetCurrentDoc<Pad>
): () => [GetCurrentDoc<Pad>, SetDoc<Pad>, ConnectCodeMirror<Pad>] {
  return function useAutomergeCodeMirror() {
    // @ts-ignore
    const [doc, setDoc] = useState(getCurrentDoc())
    const { connectCodeMirror, updateCodeMirrors } = automergeCodeMirror<Pad>(getCurrentDoc)

    function hookSetDoc(newDoc: Automerge.Doc<Pad>) {
      const newDoc2 = updateCodeMirrors(newDoc)
      setCurrentDoc(newDoc2)
      setDoc(newDoc2)
    }

    return [getCurrentDoc, hookSetDoc, connectCodeMirror]
  }
}

storiesOf('Collaboration', module).add('Multiple CodeMirrors linked to a single Automerge doc', () => {
  let pad1 = Automerge.init<Pad>()
  const getCurrentPad1: GetCurrentDoc<Pad> = () => pad1
  const setCurrentPad1: SetCurrentDoc<Pad> = (pad) => (pad1 = pad)

  return <PadComponent useAutomergeCodeMirror={makeUseAutomergeCodeMirror(getCurrentPad1, setCurrentPad1)} />

  // const useAutomergeCodeMirror1 = makeUseAutomergeCodeMirror(Automerge.init<Pad>())
  // const useAutomergeCodeMirror2 = makeUseAutomergeCodeMirror(Automerge.init<Pad>())
  //
  // const [getDoc1, setDoc1, connectCodeMirror1] = useAutomergeCodeMirror1()
  // const [getDoc2, setDoc2, connectCodeMirror2] = useAutomergeCodeMirror2()
  //
  // function setDoc1Sync(newDoc: Automerge.Doc<Pad>) {
  //   setDoc1(newDoc)
  //   const newDoc2 = Automerge.merge(getDoc2(), newDoc)
  //   setDoc2(newDoc2)
  // }
  //
  // function setDoc2Sync(newDoc: Automerge.Doc<Pad>) {
  //   setDoc2(newDoc)
  //   const newDoc1 = Automerge.merge(getDoc1(), newDoc)
  //   setDoc1(newDoc1)
  // }
  //
  // return (
  //   <div>
  //     <PadComponent useDoc={() => [getDoc1, setDoc1Sync, connectCodeMirror1]} />
  //     <PadComponent useDoc={() => [getDoc2, setDoc2Sync, connectCodeMirror2]} />
  //   </div>
  // )
})
