import Automerge from 'automerge'

export type GetText<D> = (doc: D | Automerge.Proxy<D>) => Automerge.Text
export type Notify<D> = (doc: D) => void
