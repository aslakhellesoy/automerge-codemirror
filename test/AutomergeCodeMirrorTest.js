/* eslint-env mocha */
const assert = require('assert')
require('./browserenv')
const CodeMirror = require('codemirror')
const Automerge = require('automerge')
const AutomergeCodeMirror = require('..')

describe('AutomergeCodeMirror', () => {
  const findList = doc => doc.card.title
  const getCodeMirror = objectId => codeMirrors.get(objectId)

  let cm, state, codeMirrors

  beforeEach(() => {
    codeMirrors = new Map()
    cm = CodeMirror.fromTextArea(document.getElementById('editor'))
    state = Automerge.init()
    state = Automerge.changeset(state, 'Create card', doc => {
      doc.card = {
        title: [],
      }
    })
    const objectId = state.card.title._objectId
    codeMirrors.set(objectId, cm)
  })

  describe('Automerge -> CodeMirror', () => {
    it('adds text', () => {
      const newState = Automerge.changeset(state, 'Insert', doc => {
        doc.card.title.splice(0, 0, ...'HELLO'.split(''))
      })

      AutomergeCodeMirror.applyAutomergeDiffToCodeMirror(
        state,
        newState,
        getCodeMirror
      )

      assert.strictEqual(cm.getValue(), newState.card.title.join(''))
    })

    it('removes text', () => {
      const initialState = state
      state = Automerge.changeset(state, 'Insert', doc => {
        doc.card.title.splice(0, 0, ...'HELLO'.split(''))
      })
      state = Automerge.changeset(state, 'Delete', doc => {
        doc.card.title.splice(0, 5)
      })

      AutomergeCodeMirror.applyAutomergeDiffToCodeMirror(
        initialState,
        state,
        getCodeMirror
      )

      assert.strictEqual(cm.getValue(), state.card.title.join(''))
    })

    it('replaces a couple of lines', () => {
      state = Automerge.changeset(state, 'Insert', doc => {
        const text = 'three\nblind\nmice\nsee\nhow\nthey\nrun\n'
        doc.card.title.splice(0, 0, ...text.split(''))
      })
      cm.setValue(state.card.title.join(''))
      const initialState = state

      state = Automerge.changeset(initialState, 'Replace', doc => {
        const replacement = 'evil\nrats\n'
        doc.card.title.splice(6, 11, replacement)
      })

      AutomergeCodeMirror.applyAutomergeDiffToCodeMirror(
        initialState,
        state,
        getCodeMirror
      )

      assert.strictEqual(cm.getValue(), state.card.title.join(''))
    })

    for (let n = 0; n < 10; n++) {
      it(`works with random edits (fuzz test ${n})`, () => {
        state = Automerge.changeset(state, 'Insert', doc => {
          doc.card.title.splice(0, 0, ...randomString(20).split(''))
        })
        cm.setValue(state.card.title.join(''))
        const initialState = state

        for (let t = 0; t < 10; t++) {
          const textLength = state.card.title.length
          const index = Math.floor(Math.random() * textLength)
          // const from = cm.posFromIndex(index)
          const editLength = randomInt(10)
          if (Math.random() < 0.7) {
            // Add text
            const text = randomString(editLength)
            state = Automerge.changeset(state, 'Insert', doc => {
              text
                .split('')
                .forEach((c, i) => doc.card.title.splice(index + i, 0, c))
            })
          } else {
            state = Automerge.changeset(state, 'Delete', doc => {
              doc.card.title.splice(index, editLength)
            })
          }
        }
        AutomergeCodeMirror.applyAutomergeDiffToCodeMirror(
          initialState,
          state,
          getCodeMirror
        )

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

  describe('CodeMirror <-> Automerge <-> CodeMirror', () => {
    it('syncs', () => {
      const leftDocSet = new Automerge.DocSet()
      const rightDocSet = new Automerge.DocSet()

      let leftConnection, rightConnection
      leftConnection = new Automerge.Connection(leftDocSet, message =>
        rightConnection.receiveMsg(message)
      )
      rightConnection = new Automerge.Connection(rightDocSet, message =>
        leftConnection.receiveMsg(message)
      )
      leftConnection.open()
      rightConnection.open()

      const leftDoc = Automerge.changeset(
        Automerge.init(),
        doc => (doc.text = 'hello'.split(''))
      )
      const findText = doc => doc.text

      const leftCodeMirror = CodeMirror.fromTextArea(
        document.getElementById('left')
      )
      leftDocSet.registerHandler(
        AutomergeCodeMirror.docSetHandler(
          leftDocSet,
          findText,
          (/* docId */) => leftCodeMirror
        )
      )

      const rightCodeMirror = CodeMirror.fromTextArea(
        document.getElementById('left')
      )
      rightDocSet.registerHandler(
        AutomergeCodeMirror.docSetHandler(
          rightDocSet,
          findText,
          (/* docId */) => rightCodeMirror
        )
      )

      leftDocSet.setDoc('DOC', leftDoc)

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
