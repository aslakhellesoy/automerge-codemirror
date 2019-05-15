import { Mutex } from '../../index'
import Link from '../Link'
import { WatchableDoc } from 'automerge'
export default function useCodeMirrorUpdater<T>(
  watchableDoc: WatchableDoc<T>,
  mutex: Mutex,
  links: Set<Link<T>>
): void
