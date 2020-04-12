import React, { useEffect } from 'react'
import CodeMirror from 'codemirror'
import { ConnectCodeMirror, GetText } from '../types'
import Automerge from 'automerge'

interface IProps<D> {
  makeCodeMirror: (host: HTMLElement) => CodeMirror.Editor
  connectCodeMirror: ConnectCodeMirror<D>
  watchableDoc: Automerge.WatchableDoc<D>
  getText: GetText<D>
}

const AutomergeCodeMirror = <T extends object>(props: IProps<T>) => {
  const { makeCodeMirror, connectCodeMirror, watchableDoc, getText } = props
  let codeMirrorDiv: HTMLDivElement | null

  useEffect(() => {
    const codeMirror = makeCodeMirror(codeMirrorDiv!)
    codeMirror.setValue(getText(watchableDoc.get()).toString())
    return connectCodeMirror(codeMirror, getText)
  }, [])

  return <div ref={(div) => (codeMirrorDiv = div)} />
}

export default AutomergeCodeMirror
