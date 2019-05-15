import { change, WatchableDoc } from 'automerge'
import React, { FunctionComponent } from 'react'
import ReactDataSheet from 'react-datasheet'
import 'react-datasheet/lib/react-datasheet.css'
import { useAutomergeDoc } from '../../src'

interface GridElement extends ReactDataSheet.Cell<GridElement, string | null> {
  value: string | null
}

class MyReactDataSheet extends ReactDataSheet<GridElement> {}

interface Sheet {
  grid: GridElement[][]
}

interface Props {
  watchableDoc: WatchableDoc<Sheet>
}

const GridComponent: FunctionComponent<Props> = ({ watchableDoc }) => {
  const sheet = useAutomergeDoc(watchableDoc)

  return (
    <MyReactDataSheet
      data={sheet.grid}
      valueRenderer={cell => cell.value}
      onCellsChanged={changes => {
        const doc = watchableDoc.get()
        const newDoc = change(doc, draft => {
          changes.forEach(({ row, col, value }) => {
            draft.grid[row][col].value = value
          })
        })
        watchableDoc.set(newDoc)
      }}
    />
  )
}

export { Sheet, GridComponent }
