import { Link } from './types'
import Automerge from 'automerge'
import CodeMirror, {
  Editor,
  EditorChange,
  EditorConfiguration,
} from 'codemirror'
import React, { useEffect } from 'react'
import updateAutomergeDoc from './updateAutomergeDoc'

interface Props<T> {
  links: Set<Link<T>>
  getAutomergeDoc: () => T
  getText: (doc: T) => Automerge.Text | undefined
  config: EditorConfiguration
  setAutomergeDoc: (doc: T) => void
}

export default function makeAutomergeCodeMirror<T>(): React.FunctionComponent<
  Props<T>
> {
  return ({ links, getAutomergeDoc, getText, config, setAutomergeDoc }) => {
    let codeMirrorDiv: HTMLDivElement | null

    useEffect(() => {
      const codeMirror = CodeMirror(codeMirrorDiv!, config)

      const changeHandler = (editor: Editor, change: EditorChange) => {
        const automergeChange = change.origin === 'automerge'
        if (!automergeChange) {
          const doc = updateAutomergeDoc(
            getAutomergeDoc(),
            getText,
            editor.getDoc(),
            change
          )
          setAutomergeDoc(doc)
        }
      }
      codeMirror.on('change', changeHandler)

      const link: Link<T> = {
        codeMirror,
        getText,
      }

      links.add(link)

      return () => {
        links.delete(link)
        codeMirror.off('change', changeHandler)
      }
    }, [])

    return (
      <div
        itemProp={'editor'}
        itemType="https://subsecondtdd.org/CodeMirror"
        ref={div => (codeMirrorDiv = div)}
      />
    )
  }
}
