import CodeMirror from 'codemirror'
import Mutex from './Mutex'
import { GetDoc, GetText, SetDoc } from './types'
declare type CodeMirrorChangeHandler = (
  instance: CodeMirror.Editor,
  changeObj: CodeMirror.EditorChangeLinkedList
) => void
export default function makeCodeMirrorChangeHandler<T>(
  getDoc: GetDoc<T>,
  setDoc: SetDoc<T>,
  getText: GetText<T>,
  mutex: Mutex
): {
  textObjectId: string
  codeMirrorChangeHandler: CodeMirrorChangeHandler
}
export {}
