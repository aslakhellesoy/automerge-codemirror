import { WatchableDoc } from 'automerge'
import Link from '../Link'
import Mutex from '../Mutex'
/**
 * This hook updates CodeMirror instances when {@link watchableDoc} changes.
 *
 * @param watchableDoc the doc to observe
 * @param mutex
 * @param links
 */
export default function useCodeMirrorUpdater<T>(
  watchableDoc: WatchableDoc<T>,
  mutex: Mutex,
  links: Set<Link<T>>
): void
