import Automerge from 'automerge'
import CodeMirror from 'codemirror'

export type GetText<D> = (doc: D | Automerge.Proxy<D>) => Automerge.Text
export type ConnectCodeMirror<D> = (codeMirror: CodeMirror.Editor, getText: GetText<D>) => DisconnectCodeMirror
export type DisconnectCodeMirror = () => void
export type UpdateCodemirrors<D> = (doc: D) => void
export type Notify<D> = (doc: D) => void
