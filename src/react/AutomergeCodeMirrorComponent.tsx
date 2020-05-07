import React, { useEffect } from 'react'
import CodeMirror from 'codemirror'
import { GetText } from '../types'
import AutomergeCodeMirror from '../AutomergeCodeMirror'

interface IProps<D> {
  doc: D
  makeCodeMirror: (host: HTMLElement) => CodeMirror.Editor
  automergeCodeMirror: AutomergeCodeMirror<D>
  getText: GetText<D>
}

const AutomergeCodeMirrorComponent = <D extends object>(props: IProps<D>) => {
  const { doc, makeCodeMirror, automergeCodeMirror, getText } = props
  let codeMirrorDiv: HTMLDivElement | null

  useEffect(() => {
    const codeMirror = makeCodeMirror(codeMirrorDiv!)
    return automergeCodeMirror.connectCodeMirror(doc, codeMirror, getText)
  }, [])

  return <div ref={(div) => (codeMirrorDiv = div)} />
}

export default AutomergeCodeMirrorComponent
