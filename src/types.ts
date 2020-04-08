import Automerge from 'automerge'
import CodeMirror from 'codemirror'

export type GetDoc<D> = () => D
export type SetDoc<D> = (doc: D) => void
export type GetText<D> = (doc: D | Automerge.Proxy<D>) => Automerge.Text
export type ConnectCodeMirror<D> = (
  codeMirror: CodeMirror.Editor,
  getDoc: GetDoc<D>,
  setDoc: SetDoc<D>,
  getText: GetText<D>
) => DisconnectCodeMirror
export type DisconnectCodeMirror = () => void
export type UpdateCodeMirrors<D> = (doc: D) => void
