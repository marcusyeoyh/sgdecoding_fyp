import React from "react";
import StyleButton from './styleButton'
import "./textEditor.css";
import {Editor, EditorState, RichUtils,convertToRaw} from 'draft-js'

const INLINE_STYLES = [
    { label: 'Bold', style: 'BOLD' },
    { label: 'Italic', style: 'ITALIC' },
    { label: 'Underline', style: 'UNDERLINE' },
    { label: 'Monospace', style: 'CODE' },
  ]
  
  type Props = {
    editorState: EditorState
    onToggle: (bockType: string) => void
  }
  
  const InlineStyleControls = ({ editorState, onToggle }: Props) => {
    const currentStyle = editorState.getCurrentInlineStyle()
  
    return (
      <div className='RichEditor-controls'>
        {INLINE_STYLES.map((type) => (
          <StyleButton
            key={type.label}
            active={currentStyle.has(type.style)}
            label={type.label}
            onToggle={onToggle}
            style={type.style}
          />
        ))}
      </div>
    )
  };

export default React.memo(InlineStyleControls)
