import assert from 'assert'
import './codeMirrorEnv'
import Automerge from 'automerge'
import CodeMirror from 'codemirror'
import updateCodeMirrorDocs from '../src/updateCodeMirrorDocs'
import makeCodeMirrorChangeHandler from '../src/makeCodeMirrorChangeHandler'
import Mutex from '../src/Mutex'

interface TestDoc {
  text: Automerge.Text
}

const getText = (doc: TestDoc): Automerge.Text => doc.text

describe('concurrent editing', () => {
  let leftElement: HTMLElement
  let rightElement: HTMLElement
  beforeEach(() => {
    leftElement = document.body.appendChild(document.createElement('div'))
    rightElement = document.body.appendChild(document.createElement('div'))
  })

  it('syncs', () => {
    /*
    TODO: Externalise the Doc<->Doc synchronisation
    It should be agnostic of mechanism (DocSet, Connection, Roomservice, Automerge.merge etc)

    What does this API look like??? Make a functional API with inspiration from:

    - My own drawings
    - RoomService
    - Automerge.merge
    - DocSet/Connection


     */

    let left: TestDoc = Automerge.change(Automerge.init(), (doc) => {
      doc.text = new Automerge.Text()
    })
    const leftCodeMirror = CodeMirror(leftElement)
    const leftMutex = new Mutex()
    const leftCodeMirrorMap = new Map<Automerge.UUID, CodeMirror.Editor>()

    function leftGetCodeMirror(textObjectId: Automerge.UUID): CodeMirror.Editor | undefined {
      return leftCodeMirrorMap.get(textObjectId)
    }

    function leftSync(newDoc: TestDoc) {
      const newRight = Automerge.merge(right, newDoc)
      right = updateCodeMirrorDocs(right, newRight, rightGetCodeMirror, rightMutex)
    }
    function rightSync(newDoc: TestDoc) {
      const newLeft = Automerge.merge(left, newDoc)
      leftSetDoc(newLeft)
    }

    function leftSetDoc(newDoc: TestDoc) {
      left = updateCodeMirrorDocs(left, newDoc, leftGetCodeMirror, leftMutex)
      leftSync(newDoc)
    }

    function rightSetDoc(newDoc: TestDoc) {
      right = updateCodeMirrorDocs(right, newDoc, rightGetCodeMirror, rightMutex)
      rightSync(newDoc)
    }

    const {
      textObjectId: leftTextObjectId,
      codeMirrorChangeHandler: leftCodeMirrorChangeHandler,
    } = makeCodeMirrorChangeHandler(() => left, leftSetDoc, getText, leftMutex)

    leftCodeMirrorMap.set(leftTextObjectId, leftCodeMirror)

    leftCodeMirror.on('change', leftCodeMirrorChangeHandler)

    let right: TestDoc = Automerge.init()
    right = Automerge.merge(right, left)
    const rightCodeMirror = CodeMirror(rightElement)
    const rightMutex = new Mutex()
    const rightCodeMirrorMap = new Map<Automerge.UUID, CodeMirror.Editor>()

    function rightGetCodeMirror(textObjectId: Automerge.UUID): CodeMirror.Editor | undefined {
      return rightCodeMirrorMap.get(textObjectId)
    }
    const {
      textObjectId: rightTextObjectId,
      codeMirrorChangeHandler: rightCodeMirrorChangeHandler,
    } = makeCodeMirrorChangeHandler(() => right, rightSetDoc, getText, rightMutex)
    rightCodeMirrorMap.set(rightTextObjectId, rightCodeMirror)
    rightCodeMirror.on('change', rightCodeMirrorChangeHandler)

    // Type in editors

    leftCodeMirror.getDoc().replaceRange('-leftCodeMirror', { line: 0, ch: 0 })

    assertAllContain('-leftCodeMirror')

    rightCodeMirror.getDoc().replaceRange('-rightCodeMirror', { line: 0, ch: 0 })

    assertAllContain('-rightCodeMirror-leftCodeMirror')

    rightSetDoc(Automerge.change(right, (draft) => draft.text.insertAt!(0, '-rightAutoMerge')))
    assertAllContain('-rightAutoMerge-rightCodeMirror-leftCodeMirror')

    leftSetDoc(Automerge.change(left, (draft) => draft.text.insertAt!(0, '-leftAutoMerge')))

    assertAllContain('-leftAutoMerge-rightAutoMerge-rightCodeMirror-leftCodeMirror')

    function assertAllContain(text: string) {
      assert.strictEqual(leftCodeMirror.getValue(), text)
      assert.strictEqual(rightCodeMirror.getValue(), text)
      assert.strictEqual(left.text.toString(), text)
      assert.strictEqual(right.text.toString(), text)
    }
  })
})
