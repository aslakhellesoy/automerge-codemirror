import '../codeMirrorEnv'
import { waitFor } from '@testing-library/dom'
import { render, unmountComponentAtNode } from 'react-dom'
import CodeMirror from 'codemirror'
import Automerge from 'automerge'
import React from 'react'
import assert from 'assert'
import AutomergeCodeMirror from '../../src/AutomergeCodeMirror'
import { Pad, PadComponent } from './PadComponent'
import HubDoc from '../../src/manymerge/HubDoc'
import PeerDoc from '../../src/manymerge/PeerDoc'

describe('<AutomergeCodeMirrorComponent>', () => {
  let host: HTMLElement
  let hubDoc: HubDoc<Pad>
  const peerDocs: { [peerId: string]: PeerDoc<Pad> } = {}

  beforeEach(async () => {
    host = document.body.appendChild(document.createElement('div'))

    hubDoc = new HubDoc(
      (peerId: string, msg) => {
        console.log('hub -> %s', peerId)
        peerDocs[peerId].applyMessage(msg)
        // setTimeout(()=>peerDocs[peerId].applyMessage(msg), 1)
      },
      (msg) =>
        Object.keys(peerDocs).forEach((peerId) => {
          console.log('hub -> %s', peerId)
          const peerDoc = peerDocs[peerId]
          peerDoc.applyMessage(msg)
          // setTimeout(()=>peerDoc.applyMessage(msg), 1)
        })
    )

    peerDocs['bot'] = new PeerDoc<Pad>((msg) => {
      console.log('bot -> hub')
      hubDoc.applyMessage('bot', msg)
      // setTimeout(()=>hubDoc.applyMessage('bot', msg), 1)
    })
    peerDocs['user'] = new PeerDoc<Pad>((msg) => {
      console.log('user -> hub')
      hubDoc.applyMessage('user', msg)
      // setTimeout(()=>hubDoc.applyMessage('user', msg), 1)
    })

    const userPeerDoc = peerDocs['user']
    const automergeCodeMirror = new AutomergeCodeMirror<Automerge.Doc<Pad>>(userPeerDoc.change.bind(userPeerDoc))
    render(<PadComponent peerDoc={userPeerDoc} automergeCodeMirror={automergeCodeMirror} />, host)
    await new Promise((resolve) => setTimeout(resolve, 100))
  })

  afterEach(() => {
    unmountComponentAtNode(host)
    host.remove()
  })

  it('updates Automerge doc when CodeMirror doc changes', async () => {
    peerDocs['user'].change((proxy) => (proxy.sheets = [new Automerge.Text()]))
    console.log('NEVER GET HERE!!!')
    const codeMirror: CodeMirror.Editor = await findCodeMirrorEditor(host)
    codeMirror.setValue('hello')
    assert.strictEqual(peerDocs['user'].doc.sheets[0].toString(), 'hello')

    await new Promise((resolve) => setTimeout(resolve, 50))

    assert.strictEqual(peerDocs['bot'].doc.sheets[0].toString(), 'hello')
  })

  it('updates CodeMirror doc when Automerge doc changes', async () => {
    peerDocs['bot'].change((proxy) => (proxy.sheets = [new Automerge.Text()]))
    const codeMirror: CodeMirror.Editor = await findCodeMirrorEditor(host)
    assert.strictEqual(codeMirror.getValue(), '')

    peerDocs['bot'].change((proxy) => proxy.sheets[0].insertAt!(0, ...'hello'.split('')))

    await new Promise((resolve) => setTimeout(resolve, 50))

    assert.strictEqual(codeMirror.getValue(), 'hello')
    assert.strictEqual(peerDocs['user'].doc.sheets[0].toString(), 'hello')
  })
})

async function findCodeMirrorEditor(element: HTMLElement): Promise<CodeMirror.Editor> {
  return waitFor(
    // @ts-ignore
    () => element.querySelector('.CodeMirror')!.CodeMirror!,
    { container: element }
  )
}
