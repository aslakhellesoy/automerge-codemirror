import React, { Dispatch, SetStateAction, useEffect } from 'react'
import CodeMirror from 'codemirror'
import { Proxy, Text } from 'automerge'
import makeCodeMirrorChangeHandler from '../makeCodeMirrorChangeHandler'
import Mutex from '../Mutex'

interface IProps<T> {
  makeCodeMirror: (host: HTMLElement) => CodeMirror.Editor
  getDoc: () => T
  setDoc: Dispatch<SetStateAction<T>>
  getText: (draft: Proxy<T>) => Text
  mutex: Mutex
}

const AutomergeCodeMirror = <T extends object>(props: IProps<T>) => {
  const { makeCodeMirror, getDoc, setDoc, getText, mutex } = props
  let codeMirrorDiv: HTMLDivElement | null

  useEffect(() => {
    const codeMirror = makeCodeMirror(codeMirrorDiv!)

    const { codeMirrorChangeHandler } = makeCodeMirrorChangeHandler(
      getDoc,
      setDoc,
      getText,
      mutex
    )
    codeMirror.on('change', codeMirrorChangeHandler)

    return () => {
      codeMirror.off('change', codeMirrorChangeHandler)
    }
  }, [])

  return <div ref={(div) => (codeMirrorDiv = div)} />
}

export default AutomergeCodeMirror
