import CodeMirror from 'codemirror'
import { GetDoc, GetText, SetDoc } from '../types'
interface IProps<T> {
  makeCodeMirror: (host: HTMLElement) => CodeMirror.Editor
  connectCodeMirror: (
    codeMirror: CodeMirror.Editor,
    getDoc: GetDoc<T>,
    setDoc: SetDoc<T>,
    getText: GetText<T>
  ) => () => void
  getDoc: GetDoc<T>
  setDoc: SetDoc<T>
  getText: GetText<T>
}
declare const AutomergeCodeMirror: <T extends object>(props: IProps<T>) => JSX.Element
export default AutomergeCodeMirror
