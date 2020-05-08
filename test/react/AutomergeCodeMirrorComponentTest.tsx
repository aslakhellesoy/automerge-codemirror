import '../codeMirrorEnv'
import { waitFor } from '@testing-library/dom'
import { render, unmountComponentAtNode } from 'react-dom'
import CodeMirror from 'codemirror'
import Automerge from 'automerge'
import React from 'react'
import assert from 'assert'
import AutomergeCodeMirror from '../../src/AutomergeCodeMirror'
import { Pad, PadComponent } from './PadComponent'
import HubDoc from '../../test/manymerge/HubDoc'
import PeerDoc from '../../test/manymerge/PeerDoc'

describe('<AutomergeCodeMirrorComponent>', () => {
  let host: HTMLElement
  let hubDoc: HubDoc<Pad>
  const peerDocs: { [peerId: string]: PeerDoc<Pad> } = {}

  beforeEach(async () => {
    host = document.body.appendChild(document.createElement('div'))

    hubDoc = new HubDoc(
      (peerId: string, msg) => {
        process.nextTick(() => peerDocs[peerId].applyMessage(msg))
      },
      (msg) =>
        Object.keys(peerDocs).forEach((peerId) => {
          const peerDoc = peerDocs[peerId]
          process.nextTick(() => peerDoc.applyMessage(msg))
        })
    )

    peerDocs['bot'] = new PeerDoc<Pad>((msg) => {
      process.nextTick(() => hubDoc.applyMessage('bot', msg))
    })
    peerDocs['user'] = new PeerDoc<Pad>((msg) => {
      process.nextTick(() => hubDoc.applyMessage('user', msg))
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
    const codeMirror: CodeMirror.Editor = await findCodeMirrorEditor(host)
    codeMirror.setValue('hello')
    assert.strictEqual(peerDocs['user'].doc.sheets[0].toString(), 'hello')

    peerDocs['user'].notify()
    await new Promise((resolve) => setTimeout(resolve, 50))

    assert.strictEqual(peerDocs['bot'].doc.sheets[0].toString(), 'hello')
  })

  it('updates CodeMirror doc when Automerge doc changes', async () => {
    peerDocs['bot'].change((proxy) => (proxy.sheets = [new Automerge.Text()]))
    peerDocs['bot'].notify()
    const codeMirror: CodeMirror.Editor = await findCodeMirrorEditor(host)
    assert.strictEqual(codeMirror.getValue(), '')

    peerDocs['bot'].change((proxy) => proxy.sheets[0].insertAt!(0, ...'hello'.split('')))
    peerDocs['bot'].notify()

    await new Promise((resolve) => setTimeout(resolve, 50))

    assert.strictEqual(codeMirror.getValue(), 'hello')
    assert.strictEqual(peerDocs['user'].doc.sheets[0].toString(), 'hello')
  })

  it('syncs CodeMirror doc when Automerge doc changes om 2 peers', async () => {
    peerDocs['bot'].change((proxy) => (proxy.sheets = [new Automerge.Text()]))
    peerDocs['bot'].notify()
    await new Promise((resolve) => setTimeout(resolve, 50))
    assert.strictEqual(peerDocs['user'].doc.sheets[0].toString(), '')

    peerDocs['bot'].change((proxy) => proxy.sheets[0].insertAt!(0, ...'BOT'.split('')))
    peerDocs['user'].change((proxy) => proxy.sheets[0].insertAt!(0, ...'USER'.split('')))

    peerDocs['bot'].notify()
    peerDocs['user'].notify()

    await new Promise((resolve) => setTimeout(resolve, 50))
    assert.strictEqual(peerDocs['bot'].doc.sheets[0].toString(), peerDocs['user'].doc.sheets[0].toString())
  })
})

async function findCodeMirrorEditor(element: HTMLElement): Promise<CodeMirror.Editor> {
  return waitFor(
    // @ts-ignore
    () => element.querySelector('.CodeMirror')!.CodeMirror!,
    { container: element }
  )
}
