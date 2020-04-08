import Automerge from 'automerge'

export type GetDoc<T> = () => Automerge.FreezeObject<T>
export type SetDoc<T> = (doc: Automerge.FreezeObject<T>) => void
export type GetText<T> = (doc: Automerge.FreezeObject<T> | Automerge.Proxy<T>) => Automerge.Text
