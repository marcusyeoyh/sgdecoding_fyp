
import React, {useEffect, useState}  from "react";
import NotesCard from "../../components/notes/notesCard.component";
import RecordingBar from "../../components/notes/recordingBar.component";
import { useNavigate } from "react-router-dom";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { actionCreators } from "../../state";
import { bindActionCreators } from "redux";
import { RootState } from "../../state/reducers";
import { useDispatch, useSelector } from 'react-redux';
import {userNotesResponse} from "../../models/notes.model"
import styles from "./notes.module.scss";
import ShareNotesPopup from "../../components/notes/shareNotes/shareNotesPopup.component";
const Notes: React.FC = () => {
    
    const { notes, selectedNotes } = useSelector((state: RootState) => state.notesReducer);
	const { name, role, email, type } = useSelector((state: RootState) => state.authReducer);
    
    const [NotesToDisplay, setNotesToDisplay] = useState<Array<userNotesResponse>>([]);
    const [trigger, setTrigger]= useState(true);
    const [share, setShare]= useState(false);
    const [selectedNoteId, setSelectedNoteId]= useState("");
    const dispatch = useDispatch();
    const { getAllNotes } = bindActionCreators(actionCreators, dispatch);
    const navigate = useNavigate();

	useEffect(() => {
        if(trigger===true){
		getAllNotes(email);
        }
	},[trigger]);

    useEffect(() => {
        setNotesToDisplay(notes);
        setTrigger(false);
	}, [notes]); // history, totalHistory

    const dataSize = NotesToDisplay.length%2===0?Math.floor(NotesToDisplay.length / 2):(1+Math.floor(NotesToDisplay.length / 2));

    
    const onRecordClick = (newTitle:string) => {
        navigate('/record?title='+newTitle);
    }

    return(
        <div>
            <div>
            <RecordingBar onRecordClick={onRecordClick}/>
            {share && 
                <ShareNotesPopup setShare={setShare} noteId={selectedNoteId}/>
            }
            &nbsp; &nbsp; 
            <Row id={styles.row}>
                <Col>
            {notes.slice(0,dataSize).map((curr:any) => (
                <div>
                <NotesCard
                title={curr.title}
                id={curr._id}
                setShare={setShare}
                setSelectedNoteId={setSelectedNoteId}
                ></NotesCard>
                &nbsp; &nbsp; 
                </div> 
            ))}
            </Col>
            <Col>
            {notes.slice(dataSize).map((curr:any) => (
                <div key={curr._id}> 
                    <NotesCard
                    title={curr.title}
                    id={curr._id}
                    setShare={setShare}
                    setSelectedNoteId={setSelectedNoteId}
                    ></NotesCard>
                    &nbsp; &nbsp;
                </div>
            ))}
            </Col>
            </Row>
            </div>
        </div>
    );
};

export default Notes;

