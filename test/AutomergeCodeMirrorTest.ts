import assert from 'assert'
import './codeMirrorEnv'
import Automerge from 'automerge'
import CodeMirror from 'codemirror'
import AutomergeCodeMirror from '../src/AutomergeCodeMirror'

interface TestDoc {
  text: Automerge.Text
}

describe('AutomerCodeMirror', () => {
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
      const automergeCodeMirror = new AutomergeCodeMirror<Automerge.Doc<TestDoc>>(notify)
      const disconnectCodeMirror = automergeCodeMirror.connectCodeMirror(doc, codeMirror, getText)

      doc = automergeCodeMirror.updateCodeMirrors(
        doc,
        Automerge.change(doc, (proxy) => proxy.text.insertAt!(0, 'hello'))
      )

      assert.strictEqual(codeMirror.getValue(), 'hello')

      doc = automergeCodeMirror.updateCodeMirrors(
        doc,
        Automerge.change(doc, (proxy) => proxy.text.insertAt!(0, 'world'))
      )

      assert.strictEqual(codeMirror.getValue(), 'worldhello')

      disconnectCodeMirror()
    })

    it('ignores Automerge changes after disconnection', () => {
      const notify = () => undefined
      const automergeCodeMirror = new AutomergeCodeMirror<Automerge.Doc<TestDoc>>(notify)
      const disconnectCodeMirror = automergeCodeMirror.connectCodeMirror(doc, codeMirror, getText)

      doc = automergeCodeMirror.updateCodeMirrors(
        doc,
        Automerge.change(doc, (proxy) => proxy.text.insertAt!(0, 'hello'))
      )

      assert.strictEqual(codeMirror.getValue(), 'hello')
      disconnectCodeMirror()

      doc = automergeCodeMirror.updateCodeMirrors(
        doc,
        Automerge.change(doc, (proxy) => proxy.text.insertAt!(0, 'world'))
      )

      assert.strictEqual(codeMirror.getValue(), 'hello')
    })

    it('handles document update before CodeMirror is connected', () => {
      const notify = () => undefined
      const automergeCodeMirror = new AutomergeCodeMirror<Automerge.Doc<TestDoc>>(notify)

      doc = automergeCodeMirror.updateCodeMirrors(
        doc,
        Automerge.change(doc, (proxy) => {
          proxy.text.insertAt!(0, 'World')
        })
      )

      automergeCodeMirror.connectCodeMirror(doc, codeMirror, getText)

      assert.strictEqual(codeMirror.getValue(), 'World')

      doc = automergeCodeMirror.updateCodeMirrors(
        doc,
        Automerge.change(doc, (proxy) => {
          proxy.text.insertAt!(0, 'Hello ')
        })
      )

      assert.strictEqual(codeMirror.getValue(), 'Hello World')
    })
  })

  describe('CodeMirror => Automerge', () => {
    it('handles 2 consecutive CodeMirror changes', () => {
      const automergeCodeMirror = new AutomergeCodeMirror<Automerge.Doc<TestDoc>>((newDoc) => (doc = newDoc))
      automergeCodeMirror.connectCodeMirror(doc, codeMirror, getText)

      codeMirror.replaceRange('hello', codeMirror.posFromIndex(0))
      assert.strictEqual(codeMirror.getValue(), 'hello')
      assert.strictEqual(doc.text.toString(), 'hello')

      codeMirror.replaceRange('world', codeMirror.posFromIndex(0))
      assert.strictEqual(codeMirror.getValue(), 'worldhello')
      assert.strictEqual(doc.text.toString(), 'worldhello')
    })
  })
})
