import Automerge from 'automerge'

export type GetDoc<D> = () => D
export type SetDoc<D> = (doc: D) => void
export type GetText<D> = (doc: D | Automerge.Proxy<D>) => Automerge.Text
