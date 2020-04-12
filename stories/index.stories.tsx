import { storiesOf } from '@storybook/react'
import React from 'react'
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/material.css'

import Automerge from 'automerge'
import './style.css'
import { Pad, PadComponent } from './components/PadComponent'
import Mutex from '../src/Mutex'
import { automergeCodeMirror } from '../src'

storiesOf('Collaboration', module).add('Multiple CodeMirrors linked to a single Automerge doc', () => {
  const watchableDoc1 = new Automerge.WatchableDoc(Automerge.init<Pad>())
  const watchableDoc2 = new Automerge.WatchableDoc(Automerge.init<Pad>())

  const connectCodeMirror1 = automergeCodeMirror(watchableDoc1)
  const connectCodeMirror2 = automergeCodeMirror(watchableDoc1)

  const mutex = new Mutex()
  watchableDoc1.registerHandler(() => {
    if (mutex.locked) {
      return
    }
    mutex.lock()
    watchableDoc2.set(Automerge.merge(watchableDoc2.get(), watchableDoc1.get()))
    mutex.release()
  })
  watchableDoc2.registerHandler(() => {
    if (mutex.locked) {
      return
    }
    mutex.lock()
    watchableDoc1.set(Automerge.merge(watchableDoc1.get(), watchableDoc2.get()))
    mutex.release()
  })

  return (
    <div>
      <PadComponent watchableDoc={watchableDoc1} connectCodeMirror={connectCodeMirror1} />
      <PadComponent watchableDoc={watchableDoc2} connectCodeMirror={connectCodeMirror2} />
    </div>
  )
})
