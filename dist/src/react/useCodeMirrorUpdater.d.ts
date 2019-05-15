import { WatchableDoc } from 'automerge'
import Link from '../Link'
import Mutex from '../Mutex'
export default function useCodeMirrorUpdater<T>(
  watchableDoc: WatchableDoc<T>,
  mutex: Mutex,
  links: Set<Link<T>>
): void
