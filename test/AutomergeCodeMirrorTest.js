/* eslint-env mocha */
const assert = require('assert')
require('./browserenv')
const CodeMirror = require('codemirror')
const Automerge = require('automerge')
const AutomergeCodeMirror = require('..')

describe('AutomergeCodeMirror', () => {
  let cm, doc

  beforeEach(() => {
    cm = CodeMirror.fromTextArea(document.getElementById('editor'))
    doc = Automerge.init()
    doc = Automerge.change(doc, 'Create text', doc => {
      doc.text = new Automerge.Text()
    })
  })

  describe('Automerge -> CodeMirror', () => {
    it('adds text', () => {
      const newDoc = Automerge.change(doc, 'Insert', doc => {
        doc.text.insertAt(0, ...'HELLO'.split(''))
      })

      const diff = Automerge.diff(doc, newDoc)
      AutomergeCodeMirror.applyAutomergeDiffToCodeMirror(diff, cm)

      assert.strictEqual(cm.getValue(), newDoc.text.join(''))
    })

    it('removes text', () => {
      const initialDoc = doc
      doc = Automerge.change(doc, 'Insert', doc => {
        doc.text.splice(0, 0, ...'HELLO'.split(''))
      })
      doc = Automerge.change(doc, 'Delete', doc => {
        doc.text.splice(0, 5)
      })

      const diff = Automerge.diff(initialDoc, doc)
      AutomergeCodeMirror.applyAutomergeDiffToCodeMirror(diff, cm)

      assert.strictEqual(cm.getValue(), doc.text.join(''))
    })

    it('replaces a couple of lines', () => {
      doc = Automerge.change(doc, 'Insert', doc => {
        const text = 'three\nblind\nmice\nsee\nhow\nthey\nrun\n'
        doc.text.splice(0, 0, ...text.split(''))
      })
      cm.setValue(doc.text.join(''))
      const initialDoc = doc

      doc = Automerge.change(initialDoc, 'Replace', doc => {
        const replacement = 'evil\nrats\n'
        doc.text.splice(6, 11, replacement)
      })

      const diff = Automerge.diff(initialDoc, doc)
      AutomergeCodeMirror.applyAutomergeDiffToCodeMirror(diff, cm)

      assert.strictEqual(cm.getValue(), doc.text.join(''))
    })

    for (let n = 0; n < 0; n++) {
      it(`works with random edits (fuzz test ${n})`, () => {
        doc = Automerge.change(doc, 'Insert', doc => {
          doc.text.splice(0, 0, ...randomString(20).split(''))
        })
        cm.setValue(doc.text.join(''))
        const initialDoc = doc

        for (let t = 0; t < 10; t++) {
          const textLength = doc.text.length
          const index = Math.floor(Math.random() * textLength)
          // const from = cm.posFromIndex(index)
          const editLength = randomPositiveInt(10)
          if (Math.random() < 0.7) {
            // Add text
            const text = randomString(editLength)
            try {
              doc = Automerge.change(doc, 'Insert', doc => {
                doc.text.insertAt(index, ...text.split(''))
              })
            } catch (e) {
              e.message += `\nOld text: "${doc.text.join(
                ''
              )}"\nIndex: ${index}\nInsert: "${text}"`
              throw e
            }
          } else {
            try {
              doc = Automerge.change(doc, 'Delete', doc => {
                doc.text.splice(index, editLength)
              })
            } catch (e) {
              e.message += `\nOld text: "${doc.text.join(
                ''
              )}"\nIndex: ${index}\nDelete: ${editLength}`
              throw e
            }
          }
        }
        const diff = Automerge.diff(initialDoc, doc)
        AutomergeCodeMirror.applyAutomergeDiffToCodeMirror(diff, cm)

        assert.strictEqual(doc.text.join(''), cm.getValue())
      })
    }
  })

  describe('CodeMirror -> Automerge', () => {
    beforeEach(() => {
      cm.on('change', (cm, change) => {
        doc = AutomergeCodeMirror.applyCodeMirrorChangeToAutomerge(
          doc,
          change,
          cm
        )
      })
    })

    it('adds text', () => {
      const text = 'HELLO'
      cm.setValue(text)
      assert.strictEqual(doc.text.join(''), text)
    })

    it('removes text', () => {
      cm.setValue('')
      cm.replaceRange('HELLO', { line: 0, ch: 0 })
      cm.replaceRange('', { line: 0, ch: 0 }, { line: 0, ch: 5 })
      assert.strictEqual(doc.text.join(''), cm.getValue())
    })

    it('replaces a couple of lines', () => {
      const text = 'three\nblind\nmice\nsee\nhow\nthey\nrun\n'
      cm.setValue(text)
      assert.strictEqual(doc.text.join(''), text)

      cm.replaceRange('evil\nrats\n', { line: 1, ch: 0 }, { line: 3, ch: 0 })
      assert.strictEqual(doc.text.join(''), cm.getValue())
    })

    for (let n = 0; n < 10; n++) {
      it(`works with random edits (fuzz test ${n})`, () => {
        cm.setValue(randomString(20))
        for (let t = 0; t < 10; t++) {
          monkeyType(cm)
        }
        assert.strictEqual(doc.text.join(''), cm.getValue())
      })
    }
  })

  describe('CodeMirror <-> Automerge <-> CodeMirror', () => {
    it('syncs', () => {
      /// LEFT
      const leftCodeMirror = CodeMirror.fromTextArea(
        document.getElementById('left')
      )
      const leftWatchableDoc = new Automerge.WatchableDoc(Automerge.init())
      const left = new AutomergeCodeMirror.AutomergeCodeMirror(
        leftCodeMirror,
        leftWatchableDoc
      )
      left.connect()

      /// RIGHT

      const rightCodeMirror = CodeMirror.fromTextArea(
        document.getElementById('right')
      )
      const rightWatchableDoc = new Automerge.WatchableDoc(Automerge.init())
      const right = new AutomergeCodeMirror.AutomergeCodeMirror(
        rightCodeMirror,
        rightWatchableDoc
      )
      right.connect()

      // NETWORK

      let oldLeftDoc = leftWatchableDoc.get()
      leftWatchableDoc.registerHandler(newLeftDoc => {
        const changes = Automerge.getChanges(oldLeftDoc, newLeftDoc)
        oldLeftDoc = newLeftDoc
        if (changes.length === 0) return
        rightWatchableDoc.applyChanges(changes)
      })

      let oldRightDoc = rightWatchableDoc.get()
      rightWatchableDoc.registerHandler(newRightDoc => {
        const changes = Automerge.getChanges(oldRightDoc, newRightDoc)
        oldRightDoc = newRightDoc
        if (changes.length === 0) return
        leftWatchableDoc.applyChanges(changes)
      })

      assert.strictEqual(leftCodeMirror.getValue(), '')
      assert.strictEqual(rightCodeMirror.getValue(), '')

      leftCodeMirror.setValue('hello')

      assert.strictEqual(leftCodeMirror.getValue(), 'hello')
      assert.strictEqual(rightCodeMirror.getValue(), 'hello')

      leftCodeMirror.replaceRange(
        'x',
        leftCodeMirror.posFromIndex(1),
        leftCodeMirror.posFromIndex(3)
      )

      assert.strictEqual(leftCodeMirror.getValue(), 'hxlo')
      assert.strictEqual(rightCodeMirror.getValue(), 'hxlo')

      rightCodeMirror.replaceRange(
        'y',
        rightCodeMirror.posFromIndex(1),
        rightCodeMirror.posFromIndex(3)
      )
      assert.strictEqual(leftCodeMirror.getValue(), 'hyo')
      assert.strictEqual(rightCodeMirror.getValue(), 'hyo')
    })
  })

  describe('Automerge Basics', () => {
    it('syncs 2 docs', () => {
      const l1 = Automerge.init()
      const l2 = Automerge.change(l1, doc => {
        doc.text = new Automerge.Text()
        doc.text.insertAt(0, ...'HELLO'.split(''))
      })
      assert.deepEqual('HELLO', l2.text.join(''))

      const l1c2 = Automerge.getChanges(l1, l2)

      const r1 = Automerge.init()
      const r2 = Automerge.applyChanges(r1, l1c2)
      assert.deepEqual('HELLO', r2.text.join(''))
    })
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
    const endIndex = Math.max(index + editLength, textLength - 1)
    const to = cm.posFromIndex(endIndex)
    cm.replaceRange('', from, to)
  }
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
