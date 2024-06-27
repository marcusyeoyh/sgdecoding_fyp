import React from 'react'
import "./textEditor.css";
// import 'draft-js/dist/Draft.css';

type Props = {
  active: boolean
  style: string
  label: string
  onToggle: (bockType: string) => void
}

const StyleButton = ({ active, style, label, onToggle }: Props) => {
  const _onToggle = (e: any) => {
    e.preventDefault()
    onToggle(style)
  }

  const className = 'RichEditor-styleButton'

  return (
    <button
      className={className + `${active ? ' RichEditor-activeButton' : ''}`}
      onClick={_onToggle}
    >
      {label}
    </button>
  )
}

export default React.memo(StyleButton)