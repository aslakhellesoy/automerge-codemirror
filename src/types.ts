import Automerge from 'automerge'
import CodeMirror from 'codemirror'

export type SetCurrentDoc<D> = (doc: D) => D
export type GetCurrentDoc<D> = () => D

export type SetReactState<D> = (value: React.SetStateAction<D>) => void
export type GetText<D> = (doc: D | Automerge.Proxy<D>) => Automerge.Text
export type ConnectCodeMirror<D> = (
  codeMirror: CodeMirror.Editor,
  setDoc: SetReactState<D>,
  getText: GetText<D>
) => DisconnectCodeMirror
export type DisconnectCodeMirror = () => void
export type UpdateCodeMirrors<D> = (doc: D) => D
