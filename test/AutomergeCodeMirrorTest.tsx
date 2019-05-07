import './codeMirrorEnv'
import React from 'react'
import ReactDOM from 'react-dom'
import { Editor, EditorConfiguration } from 'codemirror'
import { Link } from '../src/types'
import updateCodeMirrorDocs from '../src/updateCodeMirrorDocs'
import Automerge, { DocSet } from 'automerge'
import assert from 'assert'
import makeAutomergeCodeMirror from '../src/makeAutomergeCodeMirror'

interface TestDoc {
  text1: Automerge.Text
  text2: Automerge.Text
}

describe('<AutomergeCodeMirror/>', () => {
  it('renders an editor', async () => {
    const div = document.createElement('div')
    document.body.appendChild(div)
    const links = new Set<Link<TestDoc>>()

    const docSet = new DocSet<TestDoc>()
    let doc: TestDoc = Automerge.init()
    docSet.setDoc(
      'id',
      Automerge.change(doc, mdoc => {
        mdoc.text1 = new Automerge.Text()
        mdoc.text2 = new Automerge.Text()
      })
    )

    docSet.registerHandler((docId, newDoc) => {
      doc = updateCodeMirrorDocs(doc, newDoc, links)
    })

    const AutomergeCodeMirror = makeAutomergeCodeMirror<TestDoc>()

    const config: EditorConfiguration = {}

    const getAutomergeDoc = () => docSet.getDoc('id')
    const setAutomergeDoc = (newDoc: TestDoc) => docSet.setDoc('id', newDoc)

    ReactDOM.render(
      <div>
        <AutomergeCodeMirror
          links={links}
          getAutomergeDoc={getAutomergeDoc}
          getText={doc => doc.text1}
          config={config}
          setAutomergeDoc={setAutomergeDoc}
        />
        <AutomergeCodeMirror
          links={links}
          getAutomergeDoc={getAutomergeDoc}
          getText={doc => doc.text2}
          config={config}
          setAutomergeDoc={setAutomergeDoc}
        />
      </div>,
      div
    )

    await new Promise(resolve => setTimeout(resolve, 1))

    // Mimic incoming change
    setAutomergeDoc(
      Automerge.change(getAutomergeDoc(), mdoc => {
        mdoc.text1.insertAt!(0, ...'TEXT1')
        mdoc.text2.insertAt!(0, ...'TEXT2')
      })
    )

    const codeMirrors: Editor[] = Array.from(
      div.querySelectorAll('.CodeMirror')
    ).map(div => div['CodeMirror'])
    const strings = codeMirrors.map(codeMirror => codeMirror.getValue())

    assert.deepStrictEqual(strings, ['TEXT1', 'TEXT2'])

    // Mimic local edit
    codeMirrors[0].setValue('NEW')
    assert.deepStrictEqual(getAutomergeDoc().text1.join(''), 'NEW')
  })
})
