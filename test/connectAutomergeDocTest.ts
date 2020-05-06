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
      const { connectCodeMirror, updateCodeMirrors } = connectAutomergeDoc<Automerge.Doc<TestDoc>>(notify)
      const disconnectCodeMirror = connectCodeMirror(doc, codeMirror, getText)

      doc = updateCodeMirrors(
        doc,
        Automerge.change(doc, (proxy) => proxy.text.insertAt!(0, 'hello'))
      )

      assert.strictEqual(codeMirror.getValue(), 'hello')

      doc = updateCodeMirrors(
        doc,
        Automerge.change(doc, (proxy) => proxy.text.insertAt!(0, 'world'))
      )

      assert.strictEqual(codeMirror.getValue(), 'worldhello')

      disconnectCodeMirror()
    })

    it('ignores Automerge changes after disconnection', () => {
      const notify = () => undefined
      const { connectCodeMirror, updateCodeMirrors } = connectAutomergeDoc<Automerge.Doc<TestDoc>>(notify)
      const disconnectCodeMirror = connectCodeMirror(doc, codeMirror, getText)

      doc = updateCodeMirrors(
        doc,
        Automerge.change(doc, (proxy) => proxy.text.insertAt!(0, 'hello'))
      )

      assert.strictEqual(codeMirror.getValue(), 'hello')
      disconnectCodeMirror()

      doc = updateCodeMirrors(
        doc,
        Automerge.change(doc, (proxy) => proxy.text.insertAt!(0, 'world'))
      )

      assert.strictEqual(codeMirror.getValue(), 'hello')
    })

    it('handles document update before CodeMirror is connected', () => {
      const notify = () => undefined
      const { connectCodeMirror, updateCodeMirrors } = connectAutomergeDoc<Automerge.Doc<TestDoc>>(notify)

      doc = updateCodeMirrors(
        doc,
        Automerge.change(doc, (proxy) => {
          proxy.text.insertAt!(0, 'World')
        })
      )

      connectCodeMirror(doc, codeMirror, getText)

      assert.strictEqual(codeMirror.getValue(), 'World')

      doc = updateCodeMirrors(
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
      const { connectCodeMirror } = connectAutomergeDoc<TestDoc>((newDoc) => (doc = newDoc))
      connectCodeMirror(doc, codeMirror, getText)

      codeMirror.replaceRange('hello', codeMirror.posFromIndex(0))
      assert.strictEqual(codeMirror.getValue(), 'hello')
      assert.strictEqual(doc.text.toString(), 'hello')

      codeMirror.replaceRange('world', codeMirror.posFromIndex(0))
      assert.strictEqual(codeMirror.getValue(), 'worldhello')
      assert.strictEqual(doc.text.toString(), 'worldhello')
    })
  })
})
