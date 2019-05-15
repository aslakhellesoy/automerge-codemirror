import Automerge from 'automerge'
import { EditorConfiguration } from 'codemirror'
import React from 'react'
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
  private codeMirrorDiv
  private unmountCodeMirror
  componentDidMount(): void
  componentWillUnmount(): void
  render(): JSX.Element
}
export {}
