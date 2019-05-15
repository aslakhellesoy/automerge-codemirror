import { Link } from './types'
import Mutex from './Mutex'
/**
 * Applies the diff between two Automerge documents to CodeMirror instances
 *
 * @param oldDoc
 * @param newDoc
 * @param links
 * @param mutex
 */
export default function updateCodeMirrorDocs<T>(
  oldDoc: T,
  newDoc: T,
  links: Set<Link<T>>,
  mutex: Mutex
): T
