import React, { useEffect } from 'react'
import CodeMirror from 'codemirror'
import { ConnectCodeMirror, GetCurrentDoc, GetText, SetDoc } from '../types'

interface IProps<T> {
  makeCodeMirror: (host: HTMLElement) => CodeMirror.Editor
  connectCodeMirror: ConnectCodeMirror<T>
  getCurrentDoc: GetCurrentDoc<T>
  setDoc: SetDoc<T>
  getText: GetText<T>
}

const AutomergeCodeMirror = <T extends object>(props: IProps<T>) => {
  const { makeCodeMirror, connectCodeMirror, getCurrentDoc, setDoc, getText } = props
  let codeMirrorDiv: HTMLDivElement | null

  useEffect(() => {
    const codeMirror = makeCodeMirror(codeMirrorDiv!)
    codeMirror.setValue(getText(getCurrentDoc()).toString())
    return connectCodeMirror(codeMirror, setDoc, getText)
  }, [])

  return <div ref={(div) => (codeMirrorDiv = div)} />
}

export default AutomergeCodeMirror
