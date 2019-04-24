import * as assert from 'assert'
import './codeMirrorEnv'
import * as Automerge from 'automerge'
// import updateCodeMirror from "../src/updateCodeMirror"
import updateAutomerge from '../src/updateAutomerge'
import * as CodeMirror from 'codemirror'
import { Link } from '../src/types'
import updateCodeMirror from '../src/updateCodeMirror'

interface TestDoc {
  text: Automerge.Text
}

const getText = (doc: TestDoc): Automerge.Text => doc.text

describe('concurrent editing', () => {
  let leftDiv: HTMLDivElement
  let rightDiv: HTMLDivElement
  beforeEach(() => {
    leftDiv = document.createElement('div')
    document.body.appendChild(leftDiv)
    rightDiv = document.createElement('div')
    document.body.appendChild(rightDiv)
  })

  it('syncs', () => {
    let leftConnection: Automerge.Connection<TestDoc>
    let rightConnection: Automerge.Connection<TestDoc>

    const leftDocSet = new Automerge.DocSet<TestDoc>()
    leftConnection = new Automerge.Connection<TestDoc>(leftDocSet, msg => {
      // console.log('l->r', JSON.stringify(msg, null, 2))
      rightConnection.receiveMsg(msg)
    })

    const rightDocSet = new Automerge.DocSet<TestDoc>()
    rightConnection = new Automerge.Connection<TestDoc>(rightDocSet, msg => {
      // console.log('r->l', JSON.stringify(msg, null, 2))
      leftConnection.receiveMsg(msg)
    })

    leftConnection.open()
    rightConnection.open()

    let left: TestDoc = Automerge.change(Automerge.init(), doc => {
      doc.text = new Automerge.Text()
    })
    leftDocSet.setDoc('id', left)

    let right: TestDoc = rightDocSet.getDoc('id')

    assert.strictEqual(right.text.join(''), left.text.join(''))

    let processingCodeMirrorChangeLeft = false
    const leftCodeMirror = CodeMirror(leftDiv)
    leftCodeMirror.on('change', (editor, change) => {
      if (change.origin === 'automerge') return
      processingCodeMirrorChangeLeft = true
      leftDocSet.setDoc(
        'id',
        updateAutomerge(
          leftDocSet.getDoc('id'),
          getText,
          editor.getDoc(),
          change
        )
      )
      processingCodeMirrorChangeLeft = false
    })

    const leftLinks: Link<TestDoc>[] = [
      {
        codeMirrorDoc: leftCodeMirror.getDoc(),
        getText,
      },
    ]

    leftDocSet.registerHandler((_, newDoc) => {
      if (processingCodeMirrorChangeLeft) {
        left = newDoc
        return
      }
      updateCodeMirror(left, newDoc, leftLinks)
      left = newDoc
    })

    let processingCodeMirrorChangeRight = false
    const rightCodeMirror = CodeMirror(leftDiv)
    rightCodeMirror.on('change', (editor, change) => {
      if (change.origin === 'automerge') return
      processingCodeMirrorChangeRight = true
      rightDocSet.setDoc(
        'id',
        updateAutomerge(
          rightDocSet.getDoc('id'),
          getText,
          editor.getDoc(),
          change
        )
      )
      processingCodeMirrorChangeRight = false
    })

    const rightLinks: Link<TestDoc>[] = [
      {
        codeMirrorDoc: rightCodeMirror.getDoc(),
        getText,
      },
    ]

    rightDocSet.registerHandler((_, newDoc) => {
      if (processingCodeMirrorChangeRight) {
        right = newDoc
        return
      }
      updateCodeMirror(right, newDoc, rightLinks)
      right = newDoc
    })

    leftConnection.close()
    rightConnection.close()

    leftCodeMirror.getDoc().replaceRange('LEFT', { line: 0, ch: 0 })
    rightCodeMirror.getDoc().replaceRange('RIGHT', { line: 0, ch: 0 })

    leftConnection.open()
    rightConnection.open()

    assert.strictEqual('LEFTRIGHT', leftCodeMirror.getValue())
    assert.strictEqual('LEFTRIGHT', rightCodeMirror.getValue())

    assert.strictEqual('LEFTRIGHT', getText(left).join(''))
    assert.strictEqual('LEFTRIGHT', getText(right).join(''))
  })
})
