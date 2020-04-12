import assert from 'assert'
import './codeMirrorEnv'
import Automerge from 'automerge'
import automergeCodeMirror from '../src/automergeCodeMirror'
import CodeMirror from 'codemirror'

interface TestDoc {
  text: Automerge.Text
}

describe('automergeCodeMirror', () => {
  let watchableDoc: Automerge.WatchableDoc<TestDoc>
  const getText = (doc: TestDoc) => doc.text
  let host: HTMLElement
  let codeMirror: CodeMirror.Editor

  beforeEach(() => {
    watchableDoc = new Automerge.WatchableDoc(Automerge.from({ text: new Automerge.Text() }))
    host = document.body.appendChild(document.createElement('div'))
    codeMirror = CodeMirror(host)
  })

  afterEach(() => {
    host.remove()
  })

  describe('Automerge => CodeMirror', () => {
    it('handles 2 consecutive Automerge changes', () => {
      const { connectCodeMirror } = automergeCodeMirror(watchableDoc)
      const disconnectCodeMirror = connectCodeMirror(codeMirror, getText)

      watchableDoc.set(Automerge.change(watchableDoc.get(), (draft) => draft.text.insertAt!(0, 'hello')))

      assert.strictEqual(codeMirror.getValue(), 'hello')

      watchableDoc.set(Automerge.change(watchableDoc.get(), (draft) => draft.text.insertAt!(0, 'world')))

      assert.strictEqual(codeMirror.getValue(), 'worldhello')

      disconnectCodeMirror()
    })

    it('ignores Automerge changes after disconnection', () => {
      const { connectCodeMirror } = automergeCodeMirror<TestDoc>(watchableDoc)
      const disconnectCodeMirror = connectCodeMirror(codeMirror, getText)

      watchableDoc.set(Automerge.change(watchableDoc.get(), (draft) => draft.text.insertAt!(0, 'hello')))

      assert.strictEqual(codeMirror.getValue(), 'hello')
      disconnectCodeMirror()

      watchableDoc.set(Automerge.change(watchableDoc.get(), (draft) => draft.text.insertAt!(0, 'world')))

      assert.strictEqual(codeMirror.getValue(), 'hello')
    })
  })

  describe('CodeMirror => Automerge', () => {
    it('handles 2 consecutive CodeMirror changes', () => {
      const { connectCodeMirror } = automergeCodeMirror<TestDoc>(watchableDoc)
      connectCodeMirror(codeMirror, getText)

      codeMirror.replaceRange('hello', codeMirror.posFromIndex(0))
      assert.strictEqual(codeMirror.getValue(), 'hello')
      assert.strictEqual(watchableDoc.get().text.toString(), 'hello')

      codeMirror.replaceRange('world', codeMirror.posFromIndex(0))
      assert.strictEqual(codeMirror.getValue(), 'worldhello')
      assert.strictEqual(watchableDoc.get().text.toString(), 'worldhello')
    })
  })
})
