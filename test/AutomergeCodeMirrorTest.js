/* eslint-env mocha */
const assert = require('assert')
require('./browserenv')
const CodeMirror = require('codemirror')
const Automerge = require('automerge')
const AutomergeCodeMirror = require('..')

describe('AutomergeCodeMirror', () => {
  let cm, state

  beforeEach(() => {
    cm = CodeMirror.fromTextArea(document.getElementById('editor'))
    state = Automerge.init()
    state = Automerge.changeset(state, 'Create card', doc => {
      doc.card = {
        title: [],
      }
    })
  })

  describe('CodeMirror -> Automerge', () => {
    const findList = doc => doc.card.title

    beforeEach(() => {
      cm.on('change', (cm, change) => {
        state = AutomergeCodeMirror.applyCodeMirrorChangeToAutomerge(
          state,
          findList,
          change,
          cm
        )
      })
    })

    it('adds text', () => {
      const text = 'HELLO'
      cm.setValue(text)
      assert.strictEqual(state.card.title.join(''), text)
    })

    it('replaces a couple of lines', () => {
      const text = 'three\nblind\nmice\nsee\nhow\nthey\nrun\n'
      cm.setValue(text)
      assert.strictEqual(state.card.title.join(''), text)

      cm.replaceRange('evil\nrats\n', { line: 1, ch: 0 }, { line: 3, ch: 0 })
      assert.strictEqual(
        state.card.title.join(''),
        'three\nevil\nrats\nsee\nhow\nthey\nrun\n'
      )
    })

    for (let n = 0; n < 10; n++) {
      it(`works with random edits (fuzz test ${n})`, () => {
        cm.setValue(randomString(20))
        for (let t = 0; t < 10; t++) {
          monkeyType(cm)
        }
        assert.strictEqual(state.card.title.join(''), cm.getValue())
      })
    }
  })
})

function monkeyType(cm) {
  const textLength = cm.getValue().length
  const index = Math.floor(Math.random() * textLength)
  const from = cm.posFromIndex(index)
  const editLength = randomInt(10)
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
    const rnum = randomInt(chars.length)
    result += chars.substring(rnum, rnum + 1)
  }
  return result
}
function randomInt(max) {
  return Math.floor(Math.random() * max)
}
