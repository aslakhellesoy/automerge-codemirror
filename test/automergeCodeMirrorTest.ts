import assert from 'assert'
import './codeMirrorEnv'
import Automerge from 'automerge'
import automergeCodeMirror from '../src/automergeCodeMirror'
import CodeMirror from 'codemirror'

interface TestDoc {
  text: Automerge.Text
}

describe('automergeCodeMirror', () => {
  let doc: Automerge.FreezeObject<TestDoc>
  const setDoc = (newDoc: TestDoc) => (doc = newDoc)
  const getText = (doc: TestDoc) => doc.text
  let host: HTMLElement
  let codeMirror: CodeMirror.Editor

  beforeEach(() => {
    doc = Automerge.from({ text: new Automerge.Text() })
    host = document.body.appendChild(document.createElement('div'))
    codeMirror = CodeMirror(host)
  })

  afterEach(() => {
    host.remove()
  })

  describe('Automerge => CodeMirror', () => {
    it('handles 2 consecutive Automerge changes', () => {
      const { updateCodeMirrors, connectCodeMirror } = automergeCodeMirror<TestDoc>(() => doc)
      const disconnectCodeMirror = connectCodeMirror(codeMirror, setDoc, getText)

      doc = updateCodeMirrors(Automerge.change(doc, (draft) => draft.text.insertAt!(0, 'hello')))

      assert.strictEqual(codeMirror.getValue(), 'hello')

      doc = updateCodeMirrors(Automerge.change(doc, (draft) => draft.text.insertAt!(0, 'world')))

      assert.strictEqual(codeMirror.getValue(), 'worldhello')

      disconnectCodeMirror()
    })

    it('ignores Automerge changes after disconnection', () => {
      const { updateCodeMirrors, connectCodeMirror } = automergeCodeMirror<TestDoc>(() => doc)
      const disconnectCodeMirror = connectCodeMirror(codeMirror, setDoc, getText)

      doc = updateCodeMirrors(Automerge.change(doc, (draft) => draft.text.insertAt!(0, 'hello')))

      assert.strictEqual(codeMirror.getValue(), 'hello')
      disconnectCodeMirror()

      doc = updateCodeMirrors(Automerge.change(doc, (draft) => draft.text.insertAt!(0, 'world')))

      assert.strictEqual(codeMirror.getValue(), 'hello')
    })
  })

  describe('CodeMirror => Automerge', () => {
    it('handles 2 consecutive CodeMirror changes', () => {
      const { connectCodeMirror } = automergeCodeMirror<TestDoc>(() => doc)
      connectCodeMirror(codeMirror, setDoc, getText)

      // doc = Automerge.change(doc, draft => draft.text.insertAt!(0, 'hello'))
      codeMirror.replaceRange('hello', codeMirror.posFromIndex(0))
      assert.strictEqual(codeMirror.getValue(), 'hello')
      assert.strictEqual(doc.text.toString(), 'hello')

      codeMirror.replaceRange('world', codeMirror.posFromIndex(0))
      assert.strictEqual(codeMirror.getValue(), 'worldhello')
      assert.strictEqual(doc.text.toString(), 'worldhello')
    })
  })
})
