import CodeMirror from 'codemirror'
import Automerge from 'automerge'
import updateCodeMirrorDocs from './updateCodeMirrorDocs'
import Mutex from './Mutex'
import { ConnectCodeMirror, GetText } from './types'
import updateAutomergeDoc from './updateAutomergeDoc'

/**
 * Connect an Automerge document
 *
 * @param watchableDoc - the Automerge document that will be connected to CodeMirror instances
 * @return ConnectCodeMirror - a function for connecting an Automerge.Text object in the document to a CodeMirror instance
 */
export default function connectAutomergeDoc<D>(watchableDoc: Automerge.WatchableDoc<D>): ConnectCodeMirror<D> {
  let doc = watchableDoc.get()
  const mutex = new Mutex()
  const codeMirrorByTextId = new Map<Automerge.UUID, CodeMirror.Editor>()

  function getCodeMirror(textObjectId: Automerge.UUID): CodeMirror.Editor | undefined {
    return codeMirrorByTextId.get(textObjectId)
  }

  const watchableDocHandler = () => {
    const newDoc = watchableDoc.get()
    updateCodeMirrorDocs(doc, newDoc, getCodeMirror, mutex)
    doc = newDoc
  }

  /**
   * Connects a CodeMirror instance to an Automerge.Text object.
   *
   * @param codeMirror the editor instance
   * @param getText a function that looks up the Automerge.Text object to connect the CodeMirror editor to
   */
  function connectCodeMirror(codeMirror: CodeMirror.Editor, getText: GetText<D>) {
    const text = getText(watchableDoc.get())
    if (!text) {
      throw new Error(`Cannot connect CodeMirror. Did not find text in ${JSON.stringify(watchableDoc.get())}`)
    }
    if (codeMirrorByTextId.size === 0) {
      doc = watchableDoc.get()
      // We only start listening for Automerge document changes when the first CodeMirror instance is connected.
      watchableDoc.registerHandler(watchableDocHandler)
    }

    // Establish the association between the Automerge.Text objectId and the CodeMirror instance.
    // This association is used during the processing of diffs between two Automerge document changes,
    // so the right CodeMirror instance can be found for each Automerge.Text change.
    codeMirrorByTextId.set(Automerge.getObjectId(text), codeMirror)

    codeMirror.setValue(getText(watchableDoc.get()).toString())

    const codeMirrorChangeHandler = (editor: CodeMirror.Editor, change: CodeMirror.EditorChange) => {
      if (change.origin !== 'automerge') {
        mutex.lock()
        const newDoc = updateAutomergeDoc(watchableDoc.get(), getText, editor.getDoc(), change)
        watchableDoc.set(newDoc)
        mutex.release()
      }
    }

    codeMirror.on('change', codeMirrorChangeHandler)

    function disconnectCodeMirror() {
      codeMirror.off('change', codeMirrorChangeHandler)
      codeMirrorByTextId.delete(Automerge.getObjectId(text))
      if (codeMirrorByTextId.size === 0) {
        // We're no longer connected to any CodeMirror instances, so stop listening for Automerge document changes
        watchableDoc.unregisterHandler(watchableDocHandler)
      }
    }

    return disconnectCodeMirror
  }

  return connectCodeMirror
}
