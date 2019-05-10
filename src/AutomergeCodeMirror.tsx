import { Link } from './types'
import Automerge from 'automerge'
import CodeMirror, { EditorConfiguration } from 'codemirror'
import React from 'react'
import makeCodeMirrorChangeHandler from './makeCodeMirrorChangeHandler'
import Mutex from './Mutex'

interface Props<T> {
  links: Set<Link<T>>
  getAutomergeDoc: () => T
  getText: (doc: T) => Automerge.Text
  editorConfiguration: EditorConfiguration
  setAutomergeDoc: (doc: T) => void
  mutex: Mutex
}

class AutomergeCodeMirror<T> extends React.PureComponent<Props<T>> {
  private codeMirrorDiv: HTMLDivElement | null
  private unmountCodeMirror: () => void

  componentDidMount(): void {
    const {
      links,
      getAutomergeDoc,
      getText,
      editorConfiguration,
      setAutomergeDoc,
      mutex,
    } = this.props

    const codeMirror = CodeMirror(this.codeMirrorDiv!, editorConfiguration)
    codeMirror.setValue(getText(getAutomergeDoc()).join(''))

    const link: Link<T> = {
      codeMirror,
      getText,
    }

    links.add(link)

    const changeHandler = makeCodeMirrorChangeHandler(
      getAutomergeDoc,
      getText,
      setAutomergeDoc,
      mutex
    )
    codeMirror.on('change', changeHandler)

    this.unmountCodeMirror = () => {
      links.delete(link)
      codeMirror.off('change', changeHandler)
    }
  }

  componentWillUnmount(): void {
    this.unmountCodeMirror()
  }

  render() {
    const ref = (div: HTMLDivElement) => {
      this.codeMirrorDiv = div
    }

    return (
      <div
        itemProp={'editor'}
        itemType="https://subsecondtdd.org/CodeMirror"
        ref={ref}
      />
    )
  }
}

export default AutomergeCodeMirror
