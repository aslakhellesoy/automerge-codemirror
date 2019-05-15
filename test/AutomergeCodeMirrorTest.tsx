import './codeMirrorEnv'
import assert from 'assert'
import React from 'react'
import ReactDOM from 'react-dom'
import { Editor, EditorConfiguration } from 'codemirror'
import { change, DocSet, init, Text } from 'automerge'
import Link from '../src/Link'
import updateCodeMirrorDocs from '../src/updateCodeMirrorDocs'
import AutomergeCodeMirror from '../src/react/AutomergeCodeMirror'
import Mutex from '../src/Mutex'
import DocSetWatchableDoc from '../src/DocSetWatchableDoc'

interface TestDoc {
  text1: Text
  text2: Text
}

describe('<AutomergeCodeMirror/>', () => {
  it('renders an editor', async () => {
    const div = document.createElement('div')
    document.body.appendChild(div)
    const links = new Set<Link<TestDoc>>()

    const docSet = new DocSet<TestDoc>()
    const watchableDoc = new DocSetWatchableDoc(docSet, 'id')
    let doc: TestDoc = init()
    docSet.setDoc(
      'id',
      change(doc, mdoc => {
        mdoc.text1 = new Text()
        mdoc.text2 = new Text()
      })
    )

    const mutex = new Mutex()

    docSet.registerHandler((docId, newDoc) => {
      doc = updateCodeMirrorDocs(doc, newDoc, links, mutex)
    })

    const config: EditorConfiguration = {}

    ReactDOM.render(
      <div>
        <AutomergeCodeMirror<TestDoc>
          links={links}
          watchableDoc={watchableDoc}
          getText={doc => doc.text1}
          editorConfiguration={config}
          mutex={mutex}
        />
        <AutomergeCodeMirror<TestDoc>
          links={links}
          watchableDoc={watchableDoc}
          getText={doc => doc.text2}
          editorConfiguration={config}
          mutex={mutex}
        />
      </div>,
      div
    )

    await new Promise(resolve => setTimeout(resolve, 1))

    // Mimic incoming change
    watchableDoc.set(
      change(watchableDoc.get(), draft => {
        draft.text1.insertAt!(0, ...'TEXT1')
        draft.text2.insertAt!(0, ...'TEXT2')
      })
    )

    const codeMirrors: Editor[] = Array.from(
      div.querySelectorAll('.CodeMirror')
    ).map(div => div['CodeMirror'])
    const strings = codeMirrors.map(codeMirror => codeMirror.getValue())

    assert.deepStrictEqual(strings, ['TEXT1', 'TEXT2'])

    // Mimic local edit
    codeMirrors[0].setValue('NEW')
    assert.deepStrictEqual(watchableDoc.get().text1.join(''), 'NEW')
  })
})
