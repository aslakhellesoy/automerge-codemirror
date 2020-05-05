import assert from 'assert'
import './codeMirrorEnv'
import Automerge from 'automerge'
import CodeMirror from 'codemirror'
import connectAutomergeDoc from '../src/connectAutomergeDoc'

interface TestDoc {
  text: Automerge.Text
}

describe('connectAutomergeDoc2', () => {
  let doc: Automerge.Doc<TestDoc>
  const getText = (testDoc: TestDoc) => testDoc.text
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
      const notify = () => undefined
      const { connectCodeMirror, updateCodeMirrors } = connectAutomergeDoc(doc, notify)
      const disconnectCodeMirror = connectCodeMirror(codeMirror, getText)

      doc = Automerge.change(doc, (proxy) => proxy.text.insertAt!(0, 'hello'))
      updateCodeMirrors(doc)

      assert.strictEqual(codeMirror.getValue(), 'hello')

      doc = Automerge.change(doc, (proxy) => proxy.text.insertAt!(0, 'world'))
      updateCodeMirrors(doc)

      assert.strictEqual(codeMirror.getValue(), 'worldhello')

      disconnectCodeMirror()
    })

    it('ignores Automerge changes after disconnection', () => {
      const notify = () => undefined
      const { connectCodeMirror, updateCodeMirrors } = connectAutomergeDoc(doc, notify)
      const disconnectCodeMirror = connectCodeMirror(codeMirror, getText)

      doc = Automerge.change(doc, (proxy) => proxy.text.insertAt!(0, 'hello'))
      updateCodeMirrors(doc)

      assert.strictEqual(codeMirror.getValue(), 'hello')
      disconnectCodeMirror()

      doc = Automerge.change(doc, (proxy) => proxy.text.insertAt!(0, 'world'))
      updateCodeMirrors(doc)

      assert.strictEqual(codeMirror.getValue(), 'hello')
    })

    it('handles document update before CodeMirror is connected', () => {
      const notify = () => undefined
      const { connectCodeMirror, updateCodeMirrors } = connectAutomergeDoc(doc, notify)

      doc = Automerge.change(doc, (proxy) => {
        proxy.text.insertAt!(0, 'World')
      })
      updateCodeMirrors(doc)

      connectCodeMirror(codeMirror, getText)

      assert.strictEqual(codeMirror.getValue(), 'World')

      doc = Automerge.change(doc, (proxy) => {
        proxy.text.insertAt!(0, 'Hello ')
      })
      updateCodeMirrors(doc)

      assert.strictEqual(codeMirror.getValue(), 'Hello World')
    })
  })

  describe('CodeMirror => Automerge', () => {
    it('handles 2 consecutive CodeMirror changes', () => {
      const { connectCodeMirror } = connectAutomergeDoc<TestDoc>(doc, (newDoc) => (doc = newDoc))
      connectCodeMirror(codeMirror, getText)

      codeMirror.replaceRange('hello', codeMirror.posFromIndex(0))
      assert.strictEqual(codeMirror.getValue(), 'hello')
      assert.strictEqual(doc.text.toString(), 'hello')

      codeMirror.replaceRange('world', codeMirror.posFromIndex(0))
      assert.strictEqual(codeMirror.getValue(), 'worldhello')
      assert.strictEqual(doc.text.toString(), 'worldhello')
    })
  })
})
