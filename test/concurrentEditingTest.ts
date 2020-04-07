import assert from 'assert'
import './codeMirrorEnv'
import Automerge from 'automerge'
import CodeMirror from 'codemirror'
import updateCodeMirrorDocs from '../src/updateCodeMirrorDocs'
import makeCodeMirrorChangeHandler from '../src/makeCodeMirrorChangeHandler'
import Mutex from '../src/Mutex'

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
    let left: TestDoc = Automerge.change(Automerge.init(), (doc) => {
      doc.text = new Automerge.Text()
    })
    const leftCodeMirror = CodeMirror(leftDiv)
    const leftMutex = new Mutex()

    const leftCodeMirrorMap = new Map<Automerge.UUID, CodeMirror.Editor>()

    function leftGetCodeMirror(
      textObjectId: Automerge.UUID
    ): CodeMirror.Editor | undefined {
      return leftCodeMirrorMap.get(textObjectId)
    }

    const {
      textObjectId: leftTextObjectId,
      codeMirrorChangeHandler: leftCodeMirrorChangeHandler,
    } = makeCodeMirrorChangeHandler(
      () => left,
      (doc) => {
        left = doc
        const newRight = Automerge.merge(right, left)
        right = updateCodeMirrorDocs(
          right,
          newRight,
          rightGetCodeMirror,
          rightMutex
        )
      },
      getText,
      leftMutex
    )

    leftCodeMirrorMap.set(leftTextObjectId, leftCodeMirror)

    leftCodeMirror.on('change', leftCodeMirrorChangeHandler)

    let right: TestDoc = Automerge.init()

    right = Automerge.merge(right, left)

    const rightCodeMirror = CodeMirror(rightDiv)
    const rightMutex = new Mutex()

    const rightCodeMirrorMap = new Map<Automerge.UUID, CodeMirror.Editor>()

    function rightGetCodeMirror(
      textObjectId: Automerge.UUID
    ): CodeMirror.Editor | undefined {
      return rightCodeMirrorMap.get(textObjectId)
    }

    const {
      textObjectId: rightTextObjectId,
      codeMirrorChangeHandler: rightCodeMirrorChangeHandler,
    } = makeCodeMirrorChangeHandler(
      () => right,
      (doc) => {
        right = doc
        const newLeft = Automerge.merge(left, right)
        left = updateCodeMirrorDocs(left, newLeft, leftGetCodeMirror, leftMutex)
      },
      getText,
      rightMutex
    )

    rightCodeMirrorMap.set(rightTextObjectId, rightCodeMirror)

    rightCodeMirror.on('change', rightCodeMirrorChangeHandler)

    leftCodeMirror.getDoc().replaceRange('LEFT', { line: 0, ch: 0 })
    rightCodeMirror.getDoc().replaceRange('RIGHT', { line: 0, ch: 0 })

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
