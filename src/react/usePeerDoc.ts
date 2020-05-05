import { useState } from 'react'

export default function <D>(initialState: D) {
  const [doc, setDoc] = useState(initialState)

  return [doc, setDoc]
}
