import { WatchableDoc, Text } from 'automerge'
import CodeMirror, { EditorConfiguration } from 'codemirror'
import React from 'react'
import makeCodeMirrorChangeHandler from '../makeCodeMirrorChangeHandler'
import Link from '../Link'
import Mutex from '../Mutex'

interface Props<T> {
  watchableDoc: WatchableDoc<T>
  getText: (doc: T) => Text
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
      watchableDoc,
      getText,
      links,
      mutex,
      editorConfiguration,
    } = this.props

    const codeMirror = CodeMirror(this.codeMirrorDiv!, editorConfiguration)
    codeMirror.setValue(getText(watchableDoc.get()).join(''))

    const link: Link<T> = {
      codeMirror,
      getText,
    }

    links.add(link)

    const changeHandler = makeCodeMirrorChangeHandler(
      watchableDoc,
      getText,
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
