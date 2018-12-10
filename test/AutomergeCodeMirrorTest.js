/* eslint-env mocha */
const assert = require('assert')
require('./browserenv')
const CodeMirror = require('codemirror')
const Automerge = require('automerge')
const AutomergeCodeMirror = require('..')

let docId = 'doc-id'

describe('AutomergeCodeMirror', () => {
  let codemirror, doc, docSet, acm

  beforeEach(() => {
    doc = Automerge.change(Automerge.init(), doc => {
      doc.text = new Automerge.Text()
    })
    docSet = new Automerge.DocSet()
    docSet.setDoc(docId, doc)
    const getDocText = doc => doc.text

    codemirror = CodeMirror(document.getElementById('editor'))
    acm = new AutomergeCodeMirror(codemirror, docSet, docId, getDocText)
    acm.start()
  })

  describe('Automerge -> CodeMirror', () => {
    it('adds text', () => {
      doc = Automerge.change(doc, editableDoc => {
        editableDoc.text.insertAt(0, ...'HELLO'.split(''))
      })
      docSet.setDoc(docId, doc)

      assert.strictEqual(codemirror.getValue(), doc.text.join(''))
    })

    it('removes text', () => {
      doc = Automerge.change(doc, editableDoc => {
        editableDoc.text.splice(0, 0, ...'HELLO'.split(''))
      })
      doc = Automerge.change(doc, editableDoc => {
        editableDoc.text.splice(0, 5)
      })

      docSet.setDoc(docId, doc)

      assert.strictEqual(codemirror.getValue(), doc.text.join(''))
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

      docSet.setDoc(docId, doc)

      assert.strictEqual(
        codemirror.getValue(),
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

        docSet.setDoc(docId, doc)
        assert.strictEqual(doc.text.join(''), codemirror.getValue())
      })
    }
  })

  describe('CodeMirror -> Automerge', () => {
    it('adds text', () => {
      const text = 'HELLO'
      codemirror.setValue(text)

      doc = docSet.getDoc(docId)
      assert.strictEqual(doc.text.join(''), text)
    })

    it('removes text', () => {
      codemirror.setValue('')
      codemirror.replaceRange('HELLO', { line: 0, ch: 0 })
      codemirror.replaceRange('', { line: 0, ch: 0 }, { line: 0, ch: 5 })

      doc = docSet.getDoc(docId)
      assert.strictEqual(doc.text.join(''), codemirror.getValue())
    })

    it('replaces a couple of lines', () => {
      const text = 'three\nblind\nmice\nsee\nhow\nthey\nrun\n'
      codemirror.setValue(text)

      codemirror.replaceRange(
        'evil\nrats\n',
        { line: 1, ch: 0 },
        { line: 3, ch: 0 }
      )

      doc = docSet.getDoc(docId)
      assert.strictEqual(
        doc.text.join(''),
        'three\nevil\nrats\nsee\nhow\nthey\nrun\n'
      )
    })

    for (let n = 0; n < 10; n++) {
      it(`works with random edits (fuzz test ${n})`, () => {
        codemirror.setValue(randomString(20))
        for (let t = 0; t < 10; t++) {
          monkeyType(codemirror)
        }

        doc = docSet.getDoc(docId)
        assert.strictEqual(doc.text.join(''), codemirror.getValue())
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
