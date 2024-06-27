
import React, { useState } from "react";
import QuillTextEditor from "../../components/notes/quillJsTextEditor/quillTextEditor.component"
import { useLocation, useNavigate} from "react-router-dom";
import { Card } from "react-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../state/reducers";
import { actionCreators } from "../../state";
import { bindActionCreators } from "redux";
import styles from './edit-one-note.page.module.scss';
import { Button, Form, ButtonProps, Icon, InputOnChangeData } from "semantic-ui-react";

const OneNote: React.FC = () => {
    const [edit, setEdit] = useState(false);
    const [newTitle, setNewTitle] = useState("");
    const navigate = useNavigate();
    const {search} = useLocation();
    const title = new URLSearchParams(search).get('title')!;
    const id = new URLSearchParams(search).get('id')!;
    const note = new URLSearchParams(search).get('note')!;
    const dispatch = useDispatch();
	const { name, role, email, type } = useSelector((state: RootState) => state.authReducer);
    const { updateNotesAPI } = bindActionCreators(actionCreators, dispatch);
    const { udpateNotesTitle } = bindActionCreators(actionCreators, dispatch);

	const { selectedNotes } = useSelector((state: RootState) => state.notesReducer);

    const onSaveClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, data: ButtonProps) => {
        const text: string = selectedNotes?.text !== undefined ? selectedNotes.text : '';
        updateNotesAPI(id,text);
        if(newTitle!==""){
            udpateNotesTitle(id,newTitle);
            navigate('/OneNote?title='+newTitle+"&id="+id);
        }
        setEdit(false);
        if(note==="note") navigate('/notes');
        else navigate("/sharedNotes");
	};
    const onCancelClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, data: ButtonProps) => {
        if(note==="note") navigate('/notes');
        else navigate("/sharedNotes");
	};

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, { name, value }: InputOnChangeData) => {
        setNewTitle(value);
    }

    return(
        <div>
            <div>
                <div>
                <Button onClick={onCancelClick}>Cancel</Button>
                <Button aria-label='save notes' primary style={{float: 'right'}} onClick={onSaveClick}>Save</Button>
                </div>
                &nbsp;
                &nbsp;
                <Card id={styles.cardContainer}>
                    <div style={{marginLeft:"50px",marginTop:"30px"}}>
                    <Form style={{width:"200px"}}>
                    <Form.Input id={styles.textBox} type = 'text' onChange={handleInputChange} defaultValue = {title}/> 
                    </Form>
                        &nbsp;
                        &nbsp;
                        <QuillTextEditor/>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default OneNote;
