import assert from 'assert'
import './codeMirrorEnv'
import Automerge from 'automerge'
import updateCodeMirrorDocs from '../src/updateCodeMirrorDocs'
import CodeMirror from 'codemirror'
import { randomPositiveInt, randomString } from './random'

interface TestDoc {
  text: Automerge.Text
}

const getText = (doc: TestDoc): Automerge.Text => doc.text

describe('updateCodeMirrorDocs', () => {
  let div: HTMLDivElement
  beforeEach(() => {
    div = document.createElement('div')
    document.body.appendChild(div)
  })

  it('adds new text', () => {
    const doc1: TestDoc = Automerge.init()
    const doc2: TestDoc = Automerge.change(doc1, (editableDoc: TestDoc) => {
      editableDoc.text = new Automerge.Text()
      editableDoc.text.insertAt!(0, ...'HELLO'.split(''))
    })
    const doc3: TestDoc = Automerge.change(doc2, (editableDoc: TestDoc) => {
      editableDoc.text.insertAt!(5, ...'WORLD'.split(''))
    })

    const codeMirror = CodeMirror(div)

    const links = new Set([
      {
        codeMirror: codeMirror,
        getText,
      },
    ])
    updateCodeMirrorDocs(doc1, doc2, links)
    assert.deepStrictEqual(codeMirror.getValue(), doc2.text.join(''))

    updateCodeMirrorDocs(doc2, doc3, links)
    assert.deepStrictEqual(codeMirror.getValue(), doc3.text.join(''))
  })

  for (let n = 0; n < 10; n++) {
    it(`works with random edits (fuzz test ${n})`, () => {
      let doc: TestDoc = Automerge.change(Automerge.init(), doc => {
        doc.text = new Automerge.Text()
      })

      const codeMirror = CodeMirror(div)

      const links = new Set([
        {
          codeMirror: codeMirror,
          getText,
        },
      ])

      for (let t = 0; t < 10; t++) {
        const newDoc = monkeyModify(doc)
        updateCodeMirrorDocs(doc, newDoc, links)
        doc = newDoc
      }

      assert.deepStrictEqual(doc.text.join(''), codeMirror.getValue())
    })
  }
})

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
