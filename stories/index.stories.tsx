import { storiesOf } from '@storybook/react'
import React from 'react'
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/material.css'

import Automerge from 'automerge'
import './style.css'
import { Pad, PadComponent } from './components/PadComponent'

storiesOf('Collaboration', module).add('Multiple CodeMirrors linked to a single Automerge doc', () => {
  return (
    <div>
      <PadComponent initialPad={Automerge.init<Pad>()} />
    </div>
  )
})
