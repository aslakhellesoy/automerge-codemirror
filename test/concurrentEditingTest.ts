import assert from 'assert'
import './codeMirrorEnv'
import { change, init, merge, Text } from 'automerge'
import CodeMirror from 'codemirror'
import updateCodeMirrorDocs from '../src/updateCodeMirrorDocs'
import makeCodeMirrorChangeHandler from '../src/makeCodeMirrorChangeHandler'
import Mutex from '../src/Mutex'

interface TestDoc {
  text: Text
}

const getText = (doc: TestDoc): Text => doc.text

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
    let left: TestDoc = change(init(), (doc) => {
      doc.text = new Text()
    })
    const leftCodeMirror = CodeMirror(leftDiv)
    const leftLinks = new Set([
      {
        codeMirror: leftCodeMirror,
        getText,
      },
    ])
    const leftMutex = new Mutex()

    leftCodeMirror.on(
      'change',
      makeCodeMirrorChangeHandler(
        () => left,
        (doc) => {
          left = doc
          const newRight = merge(right, left)
          right = updateCodeMirrorDocs(right, newRight, rightLinks, rightMutex)
        },
        getText,
        leftMutex
      )
    )

    let right: TestDoc = init()
    const rightCodeMirror = CodeMirror(rightDiv)
    const rightLinks = new Set([
      {
        codeMirror: rightCodeMirror,
        getText,
      },
    ])
    const rightMutex = new Mutex()

    rightCodeMirror.on(
      'change',
      makeCodeMirrorChangeHandler(
        () => right,
        (doc) => {
          right = doc
          const newLeft = merge(left, right)
          left = updateCodeMirrorDocs(left, newLeft, leftLinks, leftMutex)
        },
        getText,
        rightMutex
      )
    )

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
