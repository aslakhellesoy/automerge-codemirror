import CodeMirror from 'codemirror'
import Automerge from 'automerge'
import updateCodeMirrorDocs from './updateCodeMirrorDocs'
import makeCodeMirrorChangeHandler from './makeCodeMirrorChangeHandler'
import Mutex from './Mutex'
import { ConnectCodeMirror, GetText } from './types'

export default function automergeCodeMirror<D>(watchableDoc: Automerge.WatchableDoc<D>): ConnectCodeMirror<D> {
  let doc = watchableDoc.get()
  const mutex = new Mutex()
  const codeMirrorMap = new Map<Automerge.UUID, CodeMirror.Editor>()

  function getCodeMirror(textObjectId: Automerge.UUID): CodeMirror.Editor | undefined {
    return codeMirrorMap.get(textObjectId)
  }

  const handler = () => {
    const newDoc = watchableDoc.get()
    updateCodeMirrorDocs(doc, newDoc, getCodeMirror, mutex)
    doc = newDoc
  }
  watchableDoc.registerHandler(handler)

  function connectCodeMirror(codeMirror: CodeMirror.Editor, getText: GetText<D>) {
    const { textObjectId, codeMirrorChangeHandler } = makeCodeMirrorChangeHandler(watchableDoc, getText, mutex)

    codeMirror.on('change', codeMirrorChangeHandler)
    codeMirrorMap.set(textObjectId, codeMirror)

    function disconnectCodeMirror() {
      codeMirror.off('change', codeMirrorChangeHandler)
      codeMirrorMap.delete(textObjectId)
    }

    return disconnectCodeMirror
  }

  return connectCodeMirror
}
