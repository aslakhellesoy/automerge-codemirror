import React, { useEffect } from 'react'
import CodeMirror from 'codemirror'
import { ConnectCodeMirror, GetText } from '../types'

interface IProps<D> {
  doc: D
  makeCodeMirror: (host: HTMLElement) => CodeMirror.Editor
  connectCodeMirror: ConnectCodeMirror<D>
  getText: GetText<D>
}

const AutomergeCodeMirror = <D extends object>(props: IProps<D>) => {
  const { doc, makeCodeMirror, connectCodeMirror, getText } = props
  let codeMirrorDiv: HTMLDivElement | null

  useEffect(() => {
    const codeMirror = makeCodeMirror(codeMirrorDiv!)
    return connectCodeMirror(doc, codeMirror, getText)
  }, [])

  return <div ref={(div) => (codeMirrorDiv = div)} />
}

export default AutomergeCodeMirror
