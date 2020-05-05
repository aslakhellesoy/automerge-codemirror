import CodeMirror from 'codemirror'
import Automerge from 'automerge'
import updateCodeMirrorDocs from './updateCodeMirrorDocs'
import Mutex from './Mutex'
import { ConnectCodeMirror, GetText, Notify, UpdateCodemirrors } from './types'
import updateAutomergeDoc from './updateAutomergeDoc'

/**
 * Connect an Automerge document
 *
 * @param doc - the Automerge document that will be connected to CodeMirror instances
 * @param notify - a callback that gets called when the doc is updated as the result of an editor change
 * @return ConnectCodeMirror - a function for connecting an Automerge.Text object in the document to a CodeMirror instance
 */
export default function connectAutomergeDoc<D>(
  doc: D,
  notify: Notify<D>
): { connectCodeMirror: ConnectCodeMirror<D>; updateCodeMirrors: UpdateCodemirrors<D> } {
  const mutex = new Mutex()
  const codeMirrorByTextId = new Map<Automerge.UUID, CodeMirror.Editor>()

  function getCodeMirror(textObjectId: Automerge.UUID): CodeMirror.Editor | undefined {
    return codeMirrorByTextId.get(textObjectId)
  }

  /**
   * Connects a CodeMirror instance to an Automerge.Text object.
   *
   * @param codeMirror the editor instance
   * @param getText a function that looks up the Automerge.Text object to connect the CodeMirror editor to
   */
  function connectCodeMirror(codeMirror: CodeMirror.Editor, getText: GetText<D>) {
    const text = getText(doc)
    if (!text) {
      throw new Error(`Cannot connect CodeMirror. Did not find text in ${JSON.stringify(doc)}`)
    }
    // Establish the association between the Automerge.Text objectId and the CodeMirror instance.
    // This association is used during the processing of diffs between two Automerge document changes,
    // so the right CodeMirror instance can be found for each Automerge.Text change.
    codeMirrorByTextId.set(Automerge.getObjectId(text), codeMirror)

    codeMirror.setValue(getText(doc).toString())

    const codeMirrorChangeHandler = (editor: CodeMirror.Editor, change: CodeMirror.EditorChange) => {
      if (change.origin !== 'automerge') {
        mutex.lock()
        doc = updateAutomergeDoc(doc, getText, editor.getDoc(), change)
        notify(doc)
        mutex.release()
      }
    }

    codeMirror.on('change', codeMirrorChangeHandler)

    function disconnectCodeMirror() {
      codeMirror.off('change', codeMirrorChangeHandler)
      codeMirrorByTextId.delete(Automerge.getObjectId(text))
    }

    return disconnectCodeMirror
  }

  function updateDoc(newDoc: D) {
    updateCodeMirrorDocs(doc, newDoc, getCodeMirror, mutex)
    doc = newDoc
  }

  return { connectCodeMirror, updateCodeMirrors: updateDoc }
}
