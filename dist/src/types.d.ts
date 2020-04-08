import Automerge from 'automerge'
export declare type GetDoc<D> = () => D
export declare type SetDoc<D> = (doc: D) => void
export declare type GetText<D> = (doc: D | Automerge.Proxy<D>) => Automerge.Text
