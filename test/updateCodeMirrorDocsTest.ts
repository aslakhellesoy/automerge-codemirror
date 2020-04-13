import assert from 'assert'
import './codeMirrorEnv'
import Automerge from 'automerge'
import updateCodeMirrorDocs from '../src/updateCodeMirrorDocs'
import CodeMirror from 'codemirror'
import { randomPositiveInt, randomString } from './random'
import Mutex from '../src/Mutex'

interface TestDoc {
  text: Automerge.Text
}

interface TestDocWithManyTexts {
  texts: Automerge.Text[]
}

describe('updateCodeMirrorDocs', () => {
  let div: HTMLDivElement
  beforeEach(() => {
    div = document.createElement('div')
    document.body.appendChild(div)
  })

  it('adds new text', () => {
    const doc1: TestDoc = Automerge.init()
    const doc2: TestDoc = Automerge.change(doc1, (draft) => {
      draft.text = new Automerge.Text()
      draft.text.insertAt!(0, ...'HELLO'.split(''))
    })
    const doc3: TestDoc = Automerge.change(doc2, (draft) => {
      draft.text.insertAt!(5, ...'WORLD'.split(''))
    })

    const codeMirror = CodeMirror(div)
    const mutex = new Mutex()

    updateCodeMirrorDocs(doc1, doc2, () => codeMirror, mutex)
    assert.deepStrictEqual(codeMirror.getValue(), doc2.text.toString())

    updateCodeMirrorDocs(doc2, doc3, () => codeMirror, mutex)
    assert.deepStrictEqual(codeMirror.getValue(), doc3.text.toString())
  })

  it('handles a removed text node without crashing', () => {
    const doc1: TestDocWithManyTexts = Automerge.init()
    const doc2: TestDocWithManyTexts = Automerge.change(doc1, (draft) => {
      draft.texts = []
      draft.texts.push(new Automerge.Text())
    })

    const codeMirror = CodeMirror(div)
    const mutex = new Mutex()

    updateCodeMirrorDocs(doc1, doc2, () => codeMirror, mutex)
    assert.deepStrictEqual(codeMirror.getValue(), doc2.texts[0].join(''))

    const doc3: TestDocWithManyTexts = Automerge.change(doc2, (draft) => {
      draft.texts.shift()
    })

    updateCodeMirrorDocs(doc2, doc3, () => codeMirror, mutex)
  })

  for (let n = 0; n < 10; n++) {
    it(`works with random edits (fuzz test ${n})`, () => {
      let doc: TestDoc = Automerge.change(Automerge.init(), (draft) => (draft.text = new Automerge.Text()))

      const codeMirror = CodeMirror(div)
      const mutex = new Mutex()

      for (let t = 0; t < 10; t++) {
        const newDoc = monkeyModify(doc)
        updateCodeMirrorDocs(doc, newDoc, () => codeMirror, mutex)
        doc = newDoc
      }

      assert.deepStrictEqual(doc.text.toString(), codeMirror.getValue())
    })
  }
})

function monkeyModify(doc: TestDoc): TestDoc {
  const textLength = doc.text.length
  const index = Math.floor(Math.random() * textLength)
  const editLength = randomPositiveInt(10)
  if (Math.random() < 0.7) {
    // Add text
    doc = Automerge.change(doc, (editableDoc) => {
      editableDoc.text.insertAt!(index, ...randomString(editLength).split(''))
    })
  } else {
    const endIndex = Math.min(index + editLength, textLength - index)
    doc = Automerge.change(doc, (editableDoc) => {
      editableDoc.text.deleteAt!(index, endIndex)
    })
  }
  return doc
}
