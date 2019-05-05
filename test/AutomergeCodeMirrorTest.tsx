import './codeMirrorEnv'
import React from 'react'
import ReactDOM from 'react-dom'
import { Editor, EditorConfiguration } from 'codemirror'
import { Link } from '../src/types'
import updateCodeMirrorDocs from '../src/updateCodeMirrorDocs'
import Automerge from 'automerge'
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

    let doc: TestDoc = Automerge.change(Automerge.init(), mdoc => {
      mdoc.text1 = new Automerge.Text()
      mdoc.text2 = new Automerge.Text()
    })

    const AutomergeCodeMirror = makeAutomergeCodeMirror<TestDoc>()

    const config: EditorConfiguration = {}

    const getAutomergeDoc = () => doc
    const setAutomergeDoc = (newDoc: TestDoc) => (doc = newDoc)

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

    let doc2: TestDoc = Automerge.change(doc, mdoc => {
      mdoc.text1.insertAt!(0, ...'TEXT1')
      mdoc.text2.insertAt!(0, ...'TEXT2')
    })
    // TODO: Use a DocSet with a handler, to mimic incoming network changes

    doc = updateCodeMirrorDocs(doc, doc2, links)

    const codeMirrors: Editor[] = Array.from(
      div.querySelectorAll('.CodeMirror')
    ).map(div => div['CodeMirror'])
    const strings = codeMirrors.map(codeMirror => codeMirror.getValue())

    assert.deepStrictEqual(strings, ['TEXT1', 'TEXT2'])

    codeMirrors[0].setValue('NEW')

    assert.deepStrictEqual(doc.text1.join(''), 'NEW')
  })
})
