import React, { useEffect } from 'react'
import CodeMirror from 'codemirror'
import { GetDoc, GetText, SetDoc } from '../types'

interface IProps<T> {
  makeCodeMirror: (host: HTMLElement) => CodeMirror.Editor
  connectCodeMirror: (
    codeMirror: CodeMirror.Editor,
    getDoc: GetDoc<T>,
    setDoc: SetDoc<T>,
    getText: GetText<T>
  ) => () => void
  getDoc: GetDoc<T>
  setDoc: SetDoc<T>
  getText: GetText<T>
}

const AutomergeCodeMirror = <T extends object>(props: IProps<T>) => {
  const { makeCodeMirror, connectCodeMirror, getDoc, setDoc, getText } = props
  let codeMirrorDiv: HTMLDivElement | null

  useEffect(() => {
    const codeMirror = makeCodeMirror(codeMirrorDiv!)
    codeMirror.setValue(getText(getDoc()).toString())
    return connectCodeMirror(codeMirror, getDoc, setDoc, getText)
  }, [])

  return <div ref={(div) => (codeMirrorDiv = div)} />
}

export default AutomergeCodeMirror
