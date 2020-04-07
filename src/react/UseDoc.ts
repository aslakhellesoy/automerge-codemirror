import { FreezeObject } from 'automerge'

export type GetDoc<T> = () => FreezeObject<T>
export type SetDoc<T> = (doc: FreezeObject<T>) => void
export type UseDoc<T> = () => [GetDoc<T>, SetDoc<T>]
