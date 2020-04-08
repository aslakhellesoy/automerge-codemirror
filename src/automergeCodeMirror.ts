import CodeMirror from 'codemirror'
import Automerge from 'automerge'
import updateCodeMirrorDocs from './updateCodeMirrorDocs'
import makeCodeMirrorChangeHandler from './makeCodeMirrorChangeHandler'
import Mutex from './Mutex'
import { ConnectCodeMirror, GetDoc, GetText, SetDoc, UpdateCodeMirrors } from './types'

export default function automergeCodeMirror<T>(
  doc: T
): { connectCodeMirror: ConnectCodeMirror<T>; updateCodeMirrors: UpdateCodeMirrors<T> } {
  const mutex = new Mutex()
  const codeMirrorMap = new Map<Automerge.UUID, CodeMirror.Editor>()

  function getCodeMirror(textObjectId: Automerge.UUID): CodeMirror.Editor | undefined {
    return codeMirrorMap.get(textObjectId)
  }

  function connectCodeMirror(codeMirror: CodeMirror.Editor, getDoc: GetDoc<T>, setDoc: SetDoc<T>, getText: GetText<T>) {
    const { textObjectId, codeMirrorChangeHandler } = makeCodeMirrorChangeHandler(getDoc, setDoc, getText, mutex)

    codeMirror.on('change', codeMirrorChangeHandler)
    codeMirrorMap.set(textObjectId, codeMirror)

    function disconnectCodeMirror() {
      codeMirror.off('change', codeMirrorChangeHandler)
      codeMirrorMap.delete(textObjectId)
    }

    return disconnectCodeMirror
  }

  function updateCodeMirrors(newDoc: T) {
    doc = updateCodeMirrorDocs(doc, newDoc, getCodeMirror, mutex)
  }

  return { connectCodeMirror, updateCodeMirrors }
}
