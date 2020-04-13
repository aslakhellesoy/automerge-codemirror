import CodeMirror from 'codemirror'
import Automerge from 'automerge'
import updateCodeMirrorDocs from './updateCodeMirrorDocs'
import makeCodeMirrorChangeHandler from './makeCodeMirrorChangeHandler'
import Mutex from './Mutex'
import { ConnectCodeMirror, GetText } from './types'

/**
 * Connect an Automerge document
 *
 * @param watchableDoc - the Automerge document that will be connected to CodeMirror instances
 * @return ConnectCodeMirror - a function for connecting an Automerge.Text object in the document to a CodeMirror instance
 */
export default function connectAutomergeDoc<D>(watchableDoc: Automerge.WatchableDoc<D>): ConnectCodeMirror<D> {
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

  function connectCodeMirror(codeMirror: CodeMirror.Editor, getText: GetText<D>) {
    codeMirror.setValue(getText(watchableDoc.get()).toString())

    if (codeMirrorMap.size === 0) {
      watchableDoc.registerHandler(handler)
    }
    const { textObjectId, codeMirrorChangeHandler } = makeCodeMirrorChangeHandler(watchableDoc, getText, mutex)

    codeMirror.on('change', codeMirrorChangeHandler)
    codeMirrorMap.set(textObjectId, codeMirror)

    function disconnectCodeMirror() {
      codeMirror.off('change', codeMirrorChangeHandler)
      codeMirrorMap.delete(textObjectId)
      if (codeMirrorMap.size === 0) {
        watchableDoc.unregisterHandler(handler)
      }
    }

    return disconnectCodeMirror
  }

  return connectCodeMirror
}
