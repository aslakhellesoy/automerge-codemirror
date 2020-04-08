import Automerge from 'automerge'
import CodeMirror from 'codemirror'
import Mutex from './Mutex'
/**
 * Applies the diff between two Automerge documents to CodeMirror instances
 *
 * @param oldDoc
 * @param newDoc
 * @param getCodeMirror
 * @param mutex
 */
export default function updateCodeMirrorDocs<T>(
  oldDoc: Automerge.FreezeObject<T>,
  newDoc: Automerge.FreezeObject<T>,
  getCodeMirror: (textObjectId: Automerge.UUID) => CodeMirror.Editor | undefined,
  mutex: Mutex
): Automerge.FreezeObject<T>
