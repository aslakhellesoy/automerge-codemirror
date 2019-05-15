import { Link } from './types'
import Automerge from 'automerge'
import { EditorConfiguration } from 'codemirror'
import React from 'react'
import Mutex from './Mutex'
interface Props<T> {
  getAutomergeDoc: () => T
  setAutomergeDoc: (doc: T) => void
  getText: (doc: T) => Automerge.Text
  links: Set<Link<T>>
  mutex: Mutex
  editorConfiguration: EditorConfiguration
}
declare class AutomergeCodeMirror<T> extends React.PureComponent<Props<T>> {
  private codeMirrorDiv
  private unmountCodeMirror
  componentDidMount(): void
  componentWillUnmount(): void
  render(): JSX.Element
}
export default AutomergeCodeMirror
