import { ConnectCodeMirror, GetCurrentDoc, SetCurrentDoc } from '../types'
import { useState } from 'react'
import automergeCodeMirror from '../automergeCodeMirror'

export default function useAutomergeCodeMirror<D>(
  getCurrentDoc: GetCurrentDoc<D>,
  setCurrentDoc: SetCurrentDoc<D>
): [ConnectCodeMirror<D>, SetCurrentDoc<D>] {
  // @ts-ignore
  const [doc, setDoc] = useState(getCurrentDoc())
  const { connectCodeMirror, updateCodeMirrors } = automergeCodeMirror(getCurrentDoc)

  function hookSetDoc(newDoc: D) {
    const newDoc2 = updateCodeMirrors(newDoc)
    setCurrentDoc(newDoc2)
    setDoc(newDoc2)
    return newDoc
  }

  return [connectCodeMirror, hookSetDoc]
}
