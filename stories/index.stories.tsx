import { storiesOf } from '@storybook/react'
import React from 'react'
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/material.css'

import Automerge from 'automerge'
import './style.css'
import { Pad, PadComponent } from './components/PadComponent'
import { GetDoc, SetDoc, UseDoc } from '../src/react/UseDoc'

storiesOf('Collaboration', module).add(
  'Multiple CodeMirrors linked to a single Automerge doc',
  () => {
    const useDocs = connectDocs([
      Automerge.init<Pad>(),
      Automerge.init<Pad>(),
      Automerge.init<Pad>(),
    ])

    const useDoc0 = useDocs[0]
    const [getDoc0, setDoc0] = useDoc0()
    setDoc0(Automerge.change(getDoc0(), (draft: Pad) => (draft.sheets = [])))

    return (
      <div>
        {useDocs.map((useDoc, n) => (
          <PadComponent key={n} useDoc={useDoc} />
        ))}
      </div>
    )
  }
)

function connectDocs<T>(
  initialDocs: ReadonlyArray<Automerge.FreezeObject<T>>
): ReadonlyArray<UseDoc<T>> {
  return initialDocs.map((initialDoc, i) => {
    let doc = initialDoc
    const getDoc: GetDoc<T> = () => doc
    const setDoc: SetDoc<T> = (newDoc: Automerge.FreezeObject<T>) => {
      doc = newDoc
    }
    const useDoc: UseDoc<T> = () => [getDoc, setDoc]
    return useDoc
  })
}
