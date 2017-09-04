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
  })
})
