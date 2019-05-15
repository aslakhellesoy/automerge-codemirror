import { WatchableDoc } from 'automerge'
/**
 * This hook updates a state variable when {@link watchableDoc} is updated.
 *
 * @param watchableDoc the doc to observe
 */
export default function useAutomergeDoc<T>(watchableDoc: WatchableDoc<T>): T
