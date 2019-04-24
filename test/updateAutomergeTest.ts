import * as assert from 'assert'
import './codeMirrorEnv'
import * as Automerge from 'automerge'
import updateAutomerge from '../src/updateAutomerge'
import * as CodeMirror from 'codemirror'
import { randomPositiveInt, randomString } from './random'

interface TestDoc {
  text: Automerge.Text
}

const getText = (doc: TestDoc): Automerge.Text => doc.text

function monkeyType(codeMirrorDoc: CodeMirror.Doc) {
  const textLength = codeMirrorDoc.getValue().length
  const index = Math.floor(Math.random() * textLength)
  const from = codeMirrorDoc.posFromIndex(index)
  const editLength = randomPositiveInt(10)
  if (Math.random() < 0.7) {
    // Add text
    const text = randomString(editLength)
    codeMirrorDoc.replaceRange(text, codeMirrorDoc.posFromIndex(index))
  } else {
    const endIndex = Math.max(index + editLength, textLength - index)
    const to = codeMirrorDoc.posFromIndex(endIndex)
    codeMirrorDoc.replaceRange('', from, to)
  }
}

describe('updateCodeMirror', () => {
  let div: HTMLDivElement
  beforeEach(() => {
    div = document.createElement('div')
    document.body.appendChild(div)
  })

  it('adds new text', () => {
    const oldDoc: TestDoc = Automerge.change(
      Automerge.init(),
      (editableDoc: TestDoc) => {
        editableDoc.text = new Automerge.Text()
      }
    )
    let newDoc: TestDoc

    const codeMirror = CodeMirror(div)
    codeMirror.on('change', (editor, change) => {
      newDoc = updateAutomerge(oldDoc, getText, editor.getDoc(), change)
    })

    codeMirror.getDoc().replaceRange('HELLO', { line: 0, ch: 0 })

    assert.deepStrictEqual('HELLO', newDoc!.text.join(''))
  })

  for (let n = 0; n < 10; n++) {
    it(`works with random edits (fuzz test ${n})`, () => {
      let doc: TestDoc = Automerge.change(Automerge.init(), doc => {
        doc.text = new Automerge.Text()
      })

      const codeMirror = CodeMirror(div)
      codeMirror.on('change', (editor, change) => {
        doc = updateAutomerge(doc, getText, editor.getDoc(), change)
      })

      for (let t = 0; t < 10; t++) {
        monkeyType(codeMirror.getDoc())
      }

      assert.deepStrictEqual(doc.text.join(''), codeMirror.getValue())
    })
  }
})
