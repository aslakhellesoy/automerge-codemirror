import CodeMirror from 'codemirror'
import Automerge from 'automerge'
import updateCodeMirrorDocs from './updateCodeMirrorDocs'
import Mutex from './Mutex'
import { Change, GetText } from './types'
import updateAutomergeText from './updateAutomergeText'

/**
 * Connect an Automerge document
 *
 * @param notify - a callback that gets called when the doc is updated as the result of an editor change
 * @return ConnectCodeMirror - a function for connecting an Automerge.Text object in the document to a CodeMirror instance
 */
export default class AutomergeCodeMirror<D> {
  private readonly mutex: Mutex = new Mutex()
  private readonly codeMirrorByTextId = new Map<Automerge.UUID, CodeMirror.Editor>()

  constructor(private readonly change: Change<D>) {}

  getCodeMirror(textObjectId: Automerge.UUID): CodeMirror.Editor | undefined {
    const editor = this.codeMirrorByTextId.get(textObjectId)
    if (!editor) {
      console.log(`Nothing for ${textObjectId}, but I had ${Array.from(this.codeMirrorByTextId.keys())}`)
    }

    return editor
  }

  /**
   * Connects a CodeMirror instance to an Automerge.Text object.
   *
   * @param doc the doc with the text
   * @param codeMirror the editor instance
   * @param getText a function that looks up the Automerge.Text object to connect the CodeMirror editor to
   */
  connectCodeMirror(doc: D, codeMirror: CodeMirror.Editor, getText: GetText<D>) {
    const text = getText(doc)
    if (!text) {
      throw new Error(`Cannot connect CodeMirror. Did not find text in ${JSON.stringify(doc)}`)
    }
    // Establish the association between the Automerge.Text objectId and the CodeMirror instance.
    // This association is used during the processing of diffs between two Automerge document changes,
    // so the right CodeMirror instance can be found for each Automerge.Text change.
    const textId = Automerge.getObjectId(text)

    this.codeMirrorByTextId.set(textId, codeMirror)

    codeMirror.setValue(text.toString())

    const codeMirrorChangeHandler = (editor: CodeMirror.Editor, editorChange: CodeMirror.EditorChange) => {
      if (editorChange.origin !== 'automerge') {
        this.mutex.lock()
        this.change((proxy) => updateAutomergeText(proxy, getText, editor.getDoc(), editorChange))
        this.mutex.release()
      }
    }

    codeMirror.on('change', codeMirrorChangeHandler)

    const disconnectCodeMirror = () => {
      codeMirror.off('change', codeMirrorChangeHandler)
      this.codeMirrorByTextId.delete(textId)
    }

    return disconnectCodeMirror
  }

  updateCodeMirrors(oldDoc: D, newDoc: D): D {
    return updateCodeMirrorDocs(oldDoc, newDoc, this.getCodeMirror.bind(this), this.mutex)
  }
}
