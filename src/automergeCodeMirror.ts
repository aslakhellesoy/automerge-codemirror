import CodeMirror from 'codemirror'
import Automerge from 'automerge'
import updateCodeMirrorDocs from './updateCodeMirrorDocs'
import makeCodeMirrorChangeHandler from './makeCodeMirrorChangeHandler'
import Mutex from './Mutex'
import { ConnectCodeMirror, GetCurrentDoc, GetText, SetReactState, UpdateCodeMirrors } from './types'

export default function automergeCodeMirror<D>(
  getCurrentDoc: GetCurrentDoc<D>
): { connectCodeMirror: ConnectCodeMirror<D>; updateCodeMirrors: UpdateCodeMirrors<D> } {
  const mutex = new Mutex()
  const codeMirrorMap = new Map<Automerge.UUID, CodeMirror.Editor>()

  function getCodeMirror(textObjectId: Automerge.UUID): CodeMirror.Editor | undefined {
    return codeMirrorMap.get(textObjectId)
  }

  function connectCodeMirror(codeMirror: CodeMirror.Editor, setDoc: SetReactState<D>, getText: GetText<D>) {
    const { textObjectId, codeMirrorChangeHandler } = makeCodeMirrorChangeHandler(getCurrentDoc, setDoc, getText, mutex)

    codeMirror.on('change', codeMirrorChangeHandler)
    codeMirrorMap.set(textObjectId, codeMirror)

    function disconnectCodeMirror() {
      codeMirror.off('change', codeMirrorChangeHandler)
      codeMirrorMap.delete(textObjectId)
    }

    return disconnectCodeMirror
  }

  function updateCodeMirrors(newDoc: D): D {
    return updateCodeMirrorDocs(getCurrentDoc(), newDoc, getCodeMirror, mutex)
  }

  return { connectCodeMirror, updateCodeMirrors }
}
