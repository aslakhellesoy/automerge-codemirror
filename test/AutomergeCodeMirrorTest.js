/* eslint-env mocha */
const assert = require('assert')
require('./browserenv')
const CodeMirror = require('codemirror')
const Automerge = require('automerge')
const AutomergeCodeMirror = require('..')

describe('AutomergeCodeMirror', () => {
  const findList = doc => doc.card.title

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

  describe('Automerge -> CodeMirror', () => {
    it('adds text', () => {
      const newState = Automerge.changeset(state, 'Insert', doc => {
        doc.card.title.splice(0, 0, ...'HELLO'.split(''))
      })

      AutomergeCodeMirror.applyAutomergeDiffToCodeMirror(state, newState, findList, cm)

      assert.strictEqual(cm.getValue(), newState.card.title.join(''))
    })

    it('removes text', () => {
      state = Automerge.changeset(state, 'Insert', doc => {
        doc.card.title.splice(0, 0, ...'HELLO'.split(''))
      })
      const newState = Automerge.changeset(state, 'Insert', doc => {
        doc.card.title.splice(0, 5)
      })

      AutomergeCodeMirror.applyAutomergeDiffToCodeMirror(state, newState, findList, cm)

      assert.strictEqual(cm.getValue(), newState.card.title.join(''))
    })

    it('replaces a couple of lines', () => {
      const text = 'three\nblind\nmice\nsee\nhow\nthey\nrun\n'
      const state2 = Automerge.changeset(state, 'Insert', doc => {
        doc.card.title.splice(0, 0, ...text.split(''))
      })
      const state3 = Automerge.changeset(state2, 'Insert', doc => {
        const replacement = 'evil\nrats\n'
        doc.card.title.splice(6, 11, replacement)
      })

      AutomergeCodeMirror.applyAutomergeDiffToCodeMirror(state, state3, findList, cm)

      assert.strictEqual(cm.getValue(), state3.card.title.join(''))
    })

    for (let n = 0; n < 10; n++) {
      it(`works with random edits (fuzz test ${n})`, () => {
        const initialState = state
        state = Automerge.changeset(state, 'Insert', doc => {
          doc.card.title.splice(0, 0, ...randomString(20).split(''))
        })
        for (let t = 0; t < 10; t++) {
          const textLength = state.card.title.length
          const index = Math.floor(Math.random() * textLength)
          // const from = cm.posFromIndex(index)
          const editLength = randomInt(10)
          if (Math.random() < 0.7) {
            // Add text
            const text = randomString(editLength)
            state = Automerge.changeset(state, 'Insert', doc => {
              doc.card.title.splice(index, 0, text)
            })
          } else {
            state = Automerge.changeset(state, 'Delete', doc => {
              doc.card.title.splice(index, editLength)
            })
          }
        }
        AutomergeCodeMirror.applyAutomergeDiffToCodeMirror(initialState, state, findList, cm)

        assert.strictEqual(state.card.title.join(''), cm.getValue())
      })
    }
  })

  describe('CodeMirror -> Automerge', () => {
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

    it('removes text', () => {
      cm.setValue('')
      cm.replaceRange('HELLO', { line: 0, ch: 0 })
      cm.replaceRange('', { line: 0, ch: 0 }, { line: 0, ch: 5 })
      assert.strictEqual(state.card.title.join(''), cm.getValue())
    })

    it('replaces a couple of lines', () => {
      const text = 'three\nblind\nmice\nsee\nhow\nthey\nrun\n'
      cm.setValue(text)
      assert.strictEqual(state.card.title.join(''), text)

      cm.replaceRange('evil\nrats\n', { line: 1, ch: 0 }, { line: 3, ch: 0 })
      assert.strictEqual(state.card.title.join(''), cm.getValue())
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
