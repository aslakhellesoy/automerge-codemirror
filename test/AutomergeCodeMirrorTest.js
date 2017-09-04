/* eslint-env mocha */
const assert = require('assert')
require('./browserenv')
const CodeMirror = require('codemirror')
const Automerge = require('automerge')
const AutomergeCodeMirror = require('..')

describe('AutomergeCodeMirror', () => {
  let initialState, initialCardState, listId, cm

  function validate(state, expectedText) {
    const deltas = Automerge.getDeltasAfter(
      state,
      Automerge.getVClock(initialState)
    )
    AutomergeCodeMirror.applyDeltasToCodeMirror(deltas, listId, cm)
    assert.equal(state.card.title.join(''), expectedText)
    assert.equal(cm.getDoc().getValue(), expectedText)
  }

  beforeEach(() => {
    cm = CodeMirror.fromTextArea(document.getElementById('editor'))
    initialState = Automerge.init()
    initialCardState = Automerge.changeset(initialState, 'Create card', doc => {
      doc.card = {
        title: [],
      }
    })
    const initialCardDeltas = Automerge.getDeltasAfter(
      initialCardState,
      Automerge.getVClock(initialState)
    )

    listId = AutomergeCodeMirror.getListId(
      initialCardDeltas,
      initialCardState.card._objectId,
      'title'
    )
  })

  it('inserts a sequence', () => {
    const state = Automerge.changeset(initialCardState, 'Edit card', doc => {
      doc.card.title.insertAt(0, 'H')
      doc.card.title.insertAt(1, 'E')
      doc.card.title.insertAt(2, 'L')
      doc.card.title.insertAt(3, 'L')
      doc.card.title.insertAt(4, 'O')
    })
    validate(state, 'HELLO')
  })

  it('inserts and deletes everything', () => {
    const s = Automerge.changeset(initialCardState, 'Add text', doc => {
      doc.card.title.insertAt(0, 'A')
      doc.card.title.insertAt(1, 'S')
    })
    const state = Automerge.changeset(s, 'Delete text', doc => {
      doc.card.title.splice(0, 2)
    })
    validate(state, '')
  })

  it('Adds and deletes a sequence', () => {
    const s = Automerge.changeset(initialCardState, 'Add text', doc => {
      doc.card.title.insertAt(0, 'H')
      doc.card.title.insertAt(1, 'E')
      doc.card.title.insertAt(2, 'L')
      doc.card.title.insertAt(3, 'L')
      doc.card.title.insertAt(4, 'O')
    })
    const state = Automerge.changeset(s, 'Delete text', doc => {
      doc.card.title.splice(1, 0, 'X')
      doc.card.title.splice(3, 2)
    })

    validate(state, 'HXEO')
  })
})
