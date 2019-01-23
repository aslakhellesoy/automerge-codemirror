/* eslint-env mocha */
const assert = require('assert')
require('./browserenv')
const CodeMirror = require('codemirror')
const Automerge = require('automerge')
const AutomergeCodeMirror = require('..')

describe('AutomergeCodeMirror', () => {
  let codeMirror, acm, doc, updateDoc

  beforeEach(() => {
    doc = Automerge.change(Automerge.init(), doc => {
      doc.text = new Automerge.Text()
    })
    const getDocText = doc => doc.text

    codeMirror = CodeMirror(document.getElementById('editor'))

    const handlers = new Set()
    updateDoc = d => {
      doc = d
      handlers.forEach(h => h(doc))
    }
    const registerHandler = handler => handlers.add(handler)
    const unregisterHandler = handler => handlers.remove(handler)

    acm = new AutomergeCodeMirror({
      codeMirror,
      getDocText,
      doc,
      updateDoc,
      registerHandler,
      unregisterHandler,
    })
    acm.start()
  })

  describe('Automerge -> CodeMirror', () => {
    it('adds text', () => {
      doc = Automerge.change(doc, editableDoc => {
        editableDoc.text.insertAt(0, ...'HELLO'.split(''))
      })
      updateDoc(doc)

      assert.strictEqual(codeMirror.getValue(), doc.text.join(''))
    })

    it('removes text', () => {
      doc = Automerge.change(doc, editableDoc => {
        editableDoc.text.splice(0, 0, ...'HELLO'.split(''))
      })
      doc = Automerge.change(doc, editableDoc => {
        editableDoc.text.splice(0, 5)
      })
      updateDoc(doc)

      assert.strictEqual(codeMirror.getValue(), doc.text.join(''))
    })

    it('replaces a couple of lines', () => {
      doc = Automerge.change(doc, editableDoc => {
        const text = 'three\nblind\nmice\nsee\nhow\nthey\nrun\n'
        editableDoc.text.splice(0, 0, ...text.split(''))
      })

      doc = Automerge.change(doc, 'Replace', doc => {
        const replacement = 'evil\nrats\n'
        doc.text.splice(6, 11, replacement)
      })

      updateDoc(doc)
      assert.strictEqual(
        codeMirror.getValue(),
        'three\nevil\nrats\nsee\nhow\nthey\nrun\n'
      )
    })

    for (let n = 0; n < 10; n++) {
      it(`works with random edits (fuzz test ${n})`, () => {
        doc = Automerge.change(doc, editableDoc => {
          editableDoc.text.splice(0, 0, ...randomString(20).split(''))
        })
        for (let t = 0; t < 10; t++) {
          doc = monkeyModify(doc)
        }

        updateDoc(doc)
        assert.strictEqual(doc.text.join(''), codeMirror.getValue())
      })
    }
  })

  describe('CodeMirror -> Automerge', () => {
    it('adds text', () => {
      const text = 'HELLO'
      codeMirror.setValue(text)

      updateDoc(doc)
      assert.strictEqual(doc.text.join(''), text)
    })

    it('removes text', () => {
      codeMirror.setValue('')
      codeMirror.replaceRange('HELLO', { line: 0, ch: 0 })
      codeMirror.replaceRange('', { line: 0, ch: 0 }, { line: 0, ch: 5 })

      assert.strictEqual(doc.text.join(''), codeMirror.getValue())
    })

    it('replaces a couple of lines', () => {
      const text = 'three\nblind\nmice\nsee\nhow\nthey\nrun\n'
      codeMirror.setValue(text)

      codeMirror.replaceRange(
        'evil\nrats\n',
        { line: 1, ch: 0 },
        { line: 3, ch: 0 }
      )

      assert.strictEqual(
        doc.text.join(''),
        'three\nevil\nrats\nsee\nhow\nthey\nrun\n'
      )
    })

    for (let n = 0; n < 10; n++) {
      it(`works with random edits (fuzz test ${n})`, () => {
        codeMirror.setValue(randomString(20))
        for (let t = 0; t < 10; t++) {
          monkeyType(codeMirror)
        }

        assert.strictEqual(doc.text.join(''), codeMirror.getValue())
      })
    }
  })
})

function monkeyType(cm) {
  const textLength = cm.getValue().length
  const index = Math.floor(Math.random() * textLength)
  const from = cm.posFromIndex(index)
  const editLength = randomPositiveInt(10)
  if (Math.random() < 0.7) {
    // Add text
    const text = randomString(editLength)
    cm.replaceRange(text, cm.posFromIndex(index))
  } else {
    const endIndex = Math.max(index + editLength, textLength - index)
    const to = cm.posFromIndex(endIndex)
    cm.replaceRange('', from, to)
  }
}

function monkeyModify(doc) {
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

function randomString(len) {
  const chars =
    '0123456789\nABCDEF\nGHIJKLM\nNOPQRSTUVWXTZ\nabcde\nfghiklmnop\nqrstuvwxyz'
  let result = ''
  for (let i = 0; i < len; i++) {
    const rnum = randomPositiveInt(chars.length)
    result += chars.substring(rnum, rnum + 1)
  }
  return result
}

function randomPositiveInt(max) {
  return Math.floor(Math.random() * max) + 1
}
