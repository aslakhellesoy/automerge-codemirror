import Automerge from 'automerge'

export type GetText<D> = (doc: D | Automerge.Proxy<D>) => Automerge.Text
export type Change<D> = (changeFn: Automerge.ChangeFn<Automerge.Proxy<D>>) => void
