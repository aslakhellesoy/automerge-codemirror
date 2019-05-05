import assert from 'assert'
import './codeMirrorEnv'
import Automerge from 'automerge'
import updateAutomerge from '../src/updateAutomergeDoc'
import CodeMirror from 'codemirror'
import updateCodeMirrorDocs from '../src/updateCodeMirrorDocs'

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

    const leftLinks = new Set([
      {
        codeMirror: leftCodeMirror,
        getText,
      },
    ])

    leftDocSet.registerHandler((_, newDoc) => {
      if (processingCodeMirrorChangeLeft) {
        left = newDoc
        return
      }
      updateCodeMirrorDocs(left, newDoc, leftLinks)
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

    const rightLinks = new Set([
      {
        codeMirror: rightCodeMirror,
        getText,
      },
    ])

    rightDocSet.registerHandler((_, newDoc) => {
      if (processingCodeMirrorChangeRight) {
        right = newDoc
        return
      }
      updateCodeMirrorDocs(right, newDoc, rightLinks)
      right = newDoc
    })

    leftConnection.close()
    rightConnection.close()

    leftCodeMirror.getDoc().replaceRange('LEFT', { line: 0, ch: 0 })
    rightCodeMirror.getDoc().replaceRange('RIGHT', { line: 0, ch: 0 })

    leftConnection.open()
    rightConnection.open()

    assertEqualsOneOf(leftCodeMirror.getValue(), 'LEFTRIGHT', 'RIGHTLEFT')
    assertEqualsOneOf(rightCodeMirror.getValue(), 'LEFTRIGHT', 'RIGHTLEFT')

    assertEqualsOneOf(getText(left).join(''), 'LEFTRIGHT', 'RIGHTLEFT')
    assertEqualsOneOf(getText(right).join(''), 'LEFTRIGHT', 'RIGHTLEFT')
  })
})

function assertEqualsOneOf(actual: any, ...expected: any) {
  assert.strictEqual(expected.length > 0, true)
  for (let i = 0; i < expected.length; i++) {
    try {
      assert.strictEqual(actual, expected[i])
      return // if we get here without an exception, that means success
    } catch (e) {
      if (!e.name.match(/^AssertionError/) || i === expected.length - 1) throw e
    }
  }
}
