import assert from 'assert'
import './codeMirrorEnv'
import { change, Connection, DocSet, init, Text } from 'automerge'
import CodeMirror from 'codemirror'
import updateCodeMirrorDocs from '../src/updateCodeMirrorDocs'
import Link from '../src/Link'
import makeCodeMirrorChangeHandler from '../src/makeCodeMirrorChangeHandler'
import Mutex from '../src/Mutex'
import DocSetWatchableDoc from '../src/DocSetWatchableDoc'

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
    let leftConnection: Connection<TestDoc>
    let rightConnection: Connection<TestDoc>

    const leftDocSet = new DocSet<TestDoc>()
    leftConnection = new Connection<TestDoc>(leftDocSet, msg => {
      rightConnection.receiveMsg(msg)
    })

    const rightDocSet = new DocSet<TestDoc>()
    rightConnection = new Connection<TestDoc>(rightDocSet, msg => {
      leftConnection.receiveMsg(msg)
    })

    leftConnection.open()
    rightConnection.open()

    let left: TestDoc = change(init(), doc => {
      doc.text = new Text()
    })
    leftDocSet.setDoc('id', left)

    let right: TestDoc = rightDocSet.getDoc('id')

    assert.strictEqual(right.text.join(''), left.text.join(''))

    const leftCodeMirror = CodeMirror(leftDiv)
    const leftLink: Link<TestDoc> = {
      codeMirror: leftCodeMirror,
      getText,
    }

    const leftWatchableDoc = new DocSetWatchableDoc(leftDocSet, 'id')
    const leftMutex = new Mutex()

    const leftCodeMirrorChangeHandler = makeCodeMirrorChangeHandler(
      leftWatchableDoc,
      getText,
      leftMutex
    )

    leftCodeMirror.on('change', leftCodeMirrorChangeHandler)

    const leftLinks = new Set([leftLink])

    leftWatchableDoc.registerHandler(newDoc => {
      left = updateCodeMirrorDocs(left, newDoc, leftLinks, leftMutex)
    })

    const rightCodeMirror = CodeMirror(rightDiv)
    const rightLink: Link<TestDoc> = {
      codeMirror: rightCodeMirror,
      getText,
    }

    const rightWatchableDoc = new DocSetWatchableDoc(rightDocSet, 'id')
    const rightMutex = new Mutex()

    const rightCodeMirrorChangeHandler = makeCodeMirrorChangeHandler(
      rightWatchableDoc,
      getText,
      rightMutex
    )

    rightCodeMirror.on('change', rightCodeMirrorChangeHandler)

    const rightLinks = new Set([rightLink])

    rightDocSet.registerHandler((_, newDoc) => {
      right = updateCodeMirrorDocs(right, newDoc, rightLinks, rightMutex)
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
