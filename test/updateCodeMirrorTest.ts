import * as assert from 'assert'
import './codeMirrorEnv'
import * as Automerge from 'automerge'
import updateCodeMirror from '../src/updateCodeMirror'
import * as CodeMirror from 'codemirror'
import { randomPositiveInt, randomString } from './random'
import { Link } from '../src/types'

interface TestDoc {
  text: Automerge.Text
}

const getText = (doc: TestDoc): Automerge.Text => doc.text

function monkeyModify(doc: TestDoc): TestDoc {
  const textLength = doc.text.length
  const index = Math.floor(Math.random() * textLength)
  // const from = cm.posFromIndex(index)
  const editLength = randomPositiveInt(10)
  if (Math.random() < 0.7) {
    // Add text
    doc = Automerge.change(doc, editableDoc => {
      editableDoc.text.splice(index, 0, ...randomString(editLength).split(''))
    })
  } else {
    const endIndex = Math.min(index + editLength, textLength - index)
    doc = Automerge.change(doc, editableDoc => {
      editableDoc.text.splice(index, endIndex)
    })
  }
  return doc
}

describe('updateCodeMirror', () => {
  let div: HTMLDivElement
  beforeEach(() => {
    div = document.createElement('div')
    document.body.appendChild(div)
  })

  it('adds new text', () => {
    const oldDoc: TestDoc = Automerge.init()
    const newDoc: TestDoc = Automerge.change(oldDoc, (editableDoc: TestDoc) => {
      editableDoc.text = new Automerge.Text()
      editableDoc.text.insertAt!(0, ...'HELLO'.split(''))
    })

    const codeMirror = CodeMirror(div)

    const links: Link<TestDoc>[] = [
      {
        codeMirrorDoc: codeMirror.getDoc(),
        getText,
      },
    ]
    updateCodeMirror(oldDoc, newDoc, links)

    assert.deepStrictEqual(codeMirror.getValue(), newDoc.text.join(''))
  })

  for (let n = 0; n < 10; n++) {
    it(`works with random edits (fuzz test ${n})`, () => {
      let doc: TestDoc = Automerge.change(Automerge.init(), doc => {
        doc.text = new Automerge.Text()
      })

      const codeMirror = CodeMirror(div)

      const links: Link<TestDoc>[] = [
        {
          codeMirrorDoc: codeMirror.getDoc(),
          getText,
        },
      ]

      for (let t = 0; t < 10; t++) {
        const newDoc = monkeyModify(doc)
        updateCodeMirror(doc, newDoc, links)
        doc = newDoc
      }

      assert.deepStrictEqual(doc.text.join(''), codeMirror.getValue())
    })
  }
})
