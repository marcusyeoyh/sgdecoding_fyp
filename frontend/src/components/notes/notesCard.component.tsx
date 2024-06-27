import React, {useEffect, useState} from 'react';
import { Card } from "react-bootstrap";
import {Button, Icon} from "semantic-ui-react";
import "./createNotesPopup.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from 'react-router-dom';
import { bindActionCreators } from "redux";
import { useDispatch, useSelector } from 'react-redux';
import { actionCreators } from "../../state";
import { RootState } from "../../state/reducers";
import { useLocation } from "react-router";
import { editNotes } from "../../api/notes-api";

interface Props {
	title:string,
  id:string,
  setShare: React.Dispatch<React.SetStateAction<boolean>>
  setSelectedNoteId: (noteId: string)=>void;
}

const NotesCard: React.FC<Props> = ({title,id,setShare,setSelectedNoteId}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { deleteSelectedNote } = bindActionCreators(actionCreators, dispatch);
  const { deleteSelectedSharedNotes } = bindActionCreators(actionCreators, dispatch);
  const { name, role, email, type } = useSelector((state: RootState) => state.authReducer);
  const [pathName, setPathName]= useState("");
	const location = useLocation();
  useEffect(()=> {
    setPathName(location.pathname);
  },[location.pathname]);
  
const cardOnClick =(id:string)=>{
    editNotes(id);
    const note = (pathName==="/notes")?"note":"sharedNote";
    navigate('/OneNote?title='+title+"&id="+id+"&note="+note);
  }

  const onDeleteClick = (id:string)=>{
    console.log("pathName",pathName);
    if(pathName==="/notes"){
        deleteSelectedNote(id,email);
    }else{
      deleteSelectedSharedNotes(id,email);
    }
  }

  const onShareClick = (id:string)=>{
    setShare(true);
    setSelectedNoteId(id);
  }
    return (
      <Card id={id}>
        <Card.Body>
          <Card.Title className="d-flex justify-content-between align-items-baseline fw-normal mb-3">
           {title}
           <Button.Group>
           <Button basic onClick={() => onShareClick(id)}>SHARE</Button>
           <Button basic icon onClick={() => onDeleteClick(id)}>
              <Icon name='trash' />
            </Button>
            </Button.Group>
          </Card.Title>
        </Card.Body>
        <Button aria-label='view notes' fluid onClick={() => cardOnClick(id)}>VIEW</Button>
      </Card>
    );
  
}

export default NotesCard;
