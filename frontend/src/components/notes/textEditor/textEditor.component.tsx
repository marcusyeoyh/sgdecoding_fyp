

import {Editor, EditorState, RichUtils,convertToRaw} from 'draft-js'
import React, {useState} from "react";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import {stateFromMarkdown} from 'draft-js-import-markdown';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import {stateToMarkdown} from 'draft-js-export-markdown';
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../../state/reducers";
import { actionCreators } from "../../../state";
import { bindActionCreators } from "redux";
import BlockStyleControls from "./blockStyleControls";
import InlineStyleControls from "./inlineStyleControls";
import "./textEditor.css";



const TextEditor = () => {
  const { final, nonFinal } = useSelector((state: RootState) => state.liveTranscribeReducer);
  const { selectedNotes } = useSelector((state: RootState) => state.notesReducer);
  const dispatch = useDispatch();
  const { updateNotesState } = bindActionCreators(actionCreators, dispatch);
  let contentState;
  if(selectedNotes!==undefined){
    contentState = stateFromMarkdown(selectedNotes.text);
  }else{
    contentState = stateFromMarkdown(final[0]);
  }
  let initialEditorState = EditorState.createWithContent(contentState);
  const [editorState, setEditorState] = useState(initialEditorState)
  const handleOnChange = (editorState: EditorState) =>{
    const text = stateToMarkdown(
      editorState.getCurrentContent()
    );
    updateNotesState(text);
    setEditorState(editorState);
  }  
  
  const onChange = (state: EditorState) => {
    setEditorState(state);
    handleOnChange(state);
  }
  const toggleBlockType = (blockType: string) => {
    onChange(RichUtils.toggleBlockType(editorState, blockType))
  }
  const toggleInlineStyle = (inlineStyle: string) => {
    onChange(RichUtils.toggleInlineStyle(editorState, inlineStyle))
  }

  return (
    <div>
      <div className="RichEditor-root">
        <BlockStyleControls
              editorState={editorState}
              onToggle={toggleBlockType}
            />
        <InlineStyleControls editorState={editorState}
              onToggle={toggleInlineStyle} />
        </div>
        <div className="PgText">
          <Editor editorState={editorState} onChange={handleOnChange}/>
        </div>
    </div>
  )
} 

export default TextEditor;