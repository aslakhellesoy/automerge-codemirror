import * as Automerge from 'automerge'
import { Link } from './types'

export default function<T>(oldDoc: T, newDoc: T, links: Link<T>[]): void {
  const diff = Automerge.diff(oldDoc, newDoc)
  for (const op of diff) {
    let codeMirror
    for (const link of links) {
      const text = link.getText(newDoc)
      const textObjectId = Automerge.getObjectId(text)
      if (op.obj === textObjectId) {
        codeMirror = link.codeMirrorDoc
        break
      }
    }
    if (!codeMirror) continue

    switch (op.action) {
      case 'insert': {
        const fromPos = codeMirror.posFromIndex(op.index!)
        codeMirror.replaceRange(op.value, fromPos, undefined, 'automerge')
        break
      }
      case 'remove': {
        const fromPos = codeMirror.posFromIndex(op.index!)
        const toPos = codeMirror.posFromIndex(op.index! + 1)
        codeMirror.replaceRange('', fromPos, toPos, 'automerge')
        break
      }
    }
  }
}
