function applyDeltasToCodeMirror(deltas, listId, cm) {
  const cmDoc = cm.getDoc()

  for (const delta of deltas) {
    const listOps = delta.ops.filter(op => op.obj === listId)
    let cursor = 0
    let offset = 0

    for (const op of listOps) {
      switch (op.action) {
        case 'makeList': {
          break
        }
        case 'ins': {
          const match = /^(.*):(\d+)$/.exec(op.key)
          if (match) cursor = parseInt(match[2])
          break
        }
        case 'set': {
          cmDoc.replaceRange(op.value, cmDoc.posFromIndex(cursor))
          break
        }
        case 'del': {
          const match = /^(.*):(\d+)$/.exec(op.key)
          if (match) cursor = parseInt(match[2])
          const cur = cursor + offset
          cmDoc.replaceRange(
            '',
            cmDoc.posFromIndex(cur),
            cmDoc.posFromIndex(cur + 1)
          )
          offset--
          break
        }
        default:
          throw new Error(`Unexpected op: ${JSON.stringify(op)}`)
      }
    }
  }
}

function getListId(deltas, objectId, key) {
  for (const delta of deltas) {
    const linkOp = delta.ops.find(
      op => op.action === 'link' && op.obj === objectId && op.key === key
    )
    if (linkOp) return linkOp.value
  }
}

module.exports = { getListId, applyDeltasToCodeMirror }
