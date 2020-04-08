import CodeMirror from 'codemirror'
import Automerge from 'automerge'
import { GetDoc, GetText, SetDoc } from './types'
export default function automergeCodeMirror<T>(
  doc: Automerge.FreezeObject<T>
): {
  connectCodeMirror: (
    codeMirror: CodeMirror.Editor,
    getDoc: GetDoc<T>,
    setDoc: SetDoc<T>,
    getText: GetText<T>
  ) => () => void
  updateCodeMirrors: (newDoc: Automerge.FreezeObject<T>) => void
}
