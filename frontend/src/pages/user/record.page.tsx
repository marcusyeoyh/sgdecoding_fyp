
import React, { useState } from "react";
import TextEditor from "../../components/notes/textEditor/textEditor.component";
import QuillTextEditor from "../../components/notes/quillJsTextEditor/quillTextEditor.component"
import LiveTranscribe from "../../components/notes/liveTranscribe.component";
import { useLocation, useNavigate} from "react-router-dom";
import { Card } from "react-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../state/reducers";
import { actionCreators } from "../../state";
import { bindActionCreators } from "redux";
import { Button, Form, ButtonProps, Icon, InputOnChangeData } from "semantic-ui-react";
import { editNotes } from "../../api/notes-api";

const RecordPage: React.FC = () => {
    const [editDisable, setEditDisable] = useState(false);
    const navigate = useNavigate();
    const {search} = useLocation();
    const title = new URLSearchParams(search).get('title')!;
    const dispatch = useDispatch();
	const { name, role, email, type } = useSelector((state: RootState) => state.authReducer);
    const { createNewNotesWText } = bindActionCreators(actionCreators, dispatch);
	const { selectedNotes } = useSelector((state: RootState) => state.notesReducer);
    const { updateNotesState } = bindActionCreators(actionCreators, dispatch);


    const onBackClick = () => {
        updateNotesState("");
        navigate('/notes');        
    }

    const onSaveClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, data: ButtonProps) => {
		const text: string = selectedNotes?.text !== undefined ? selectedNotes.text : '';
		const currentNotes = JSON.stringify([{'insert':text}]);
        createNewNotesWText(email,title,currentNotes); //TODO : Add spinner before nagivating back to notes
        updateNotesState("");
        navigate('/notes');
	};
    

    return(
        <div>
            <div>
            <div>
                <Button disabled={editDisable} onClick={onBackClick}>BACK</Button>
                <Button disabled={editDisable} icon style={{float: 'right'}}  primary labelPosition='right' onClick={onSaveClick}>
                    <Icon name='save' />SAVE
                </Button>        
            </div>
            &nbsp;
            &nbsp;
            <LiveTranscribe editDisable={setEditDisable}/>
            </div>
        </div>
    );
};

export default RecordPage;
