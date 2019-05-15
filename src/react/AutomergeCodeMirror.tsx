import Automerge from 'automerge'
import CodeMirror, { EditorConfiguration } from 'codemirror'
import React from 'react'
import makeCodeMirrorChangeHandler from '../makeCodeMirrorChangeHandler'
import Link from '../Link'
import Mutex from '../Mutex'

interface Props<T> {
  getAutomergeDoc: () => T
  setAutomergeDoc: (doc: T) => void
  getText: (doc: T) => Automerge.Text
  links: Set<Link<T>>
  mutex: Mutex
  editorConfiguration: EditorConfiguration
}

export default class AutomergeCodeMirror<T> extends React.PureComponent<
  Props<T>
> {
  private codeMirrorDiv: HTMLDivElement | null
  private unmountCodeMirror: () => void

  componentDidMount(): void {
    const {
      getAutomergeDoc,
      setAutomergeDoc,
      getText,
      links,
      mutex,
      editorConfiguration,
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
