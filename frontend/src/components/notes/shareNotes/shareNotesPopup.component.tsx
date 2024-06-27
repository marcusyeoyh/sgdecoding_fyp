import React, {useState} from 'react';
import { Modal, ModalHeader, ModalBody } from 'reactstrap';
import "./shareNotesPopup.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import { bindActionCreators } from "redux";
import { RootState } from "../../../state/reducers";
import { useDispatch, useSelector } from 'react-redux';
import { actionCreators } from "../../../state";
import { Button,  Form, Header, Message,InputOnChangeData } from 'semantic-ui-react';
import { useForm } from 'react-hook-form';


interface Props {
  setShare: React.Dispatch<React.SetStateAction<boolean>>,
  noteId: string
}

const ShareNotesPopup: React.FC<Props> = ({setShare,noteId}) => {
    const { name, role, email, type } = useSelector((state: RootState) => state.authReducer);
    const [isError, setIsError] = useState(false);
    const [invalidEmail, setInvalidEmail] = useState(false);
    const [invalidShare, setInvalidShare] = useState(false);
    const dispatch = useDispatch();
    const { createOneSharedNotes } = bindActionCreators(actionCreators, dispatch);

    const {
      handleSubmit,
      setValue,
      formState: { errors }
    } = useForm({ mode: 'onBlur' });

    const onToggle = () => {
      setShare(false);
	};  

  function isValidEmail(email: string) {
    return /\S+@\S+\.\S+/.test(email);
  }

  const onSubmit = async (data: { collaboratorEmail: string }) => {
    if(data.collaboratorEmail===null || data.collaboratorEmail === undefined){
      setIsError(true);
    }else if (isValidEmail(data.collaboratorEmail)===false){
      setInvalidEmail(true);
    }else if (email === data.collaboratorEmail){
      setInvalidShare(true);
    }else{
      createOneSharedNotes(data.collaboratorEmail,noteId);
      setShare(false);
      onToggle();

    };
	};

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>, { name, value }: InputOnChangeData) => {
		setValue(name, value);
    setIsError(false);
	};
    return (
      <div>
        <Modal contentClassName="custom-modal-style" isOpen={true} toggle={onToggle} center>
          <ModalHeader toggle={onToggle}>Add collaborators</ModalHeader>
          <ModalBody>
          <Form
          onSubmit={handleSubmit(onSubmit as any)}
          noValidate
          role="form"
          aria-label="Login Form"
			>
				<Message
					error
          visible = {invalidEmail}
					header='Invalid Email'
					content='Please Enter a Valid Email'
				/>
        <Message
					error
          visible = {invalidShare}
					header='Unable to Share'
					content='Unable to share to your own account'
				/>
				
				<Form.Field>
					<Form.Input
						name='collaboratorEmail'
						label="Enter email to send collaboration invitation"
						fluid
						type='title'
            required={true}
						placeholder='enter email here'
						onChange={onInputChange}
						error={isError?{
              content: 'Title cannot be empty',
              pointing: 'below',
            }:null}
						role="text"
						aria-label="Collaborator email input"
					/>
				</Form.Field>
				<Button
					primary
					content="INVITE"
					type='submit'
					role='button'
					aria-label='Share Notes Button'
				/>
			</Form>
          </ModalBody>
        </Modal>
        </div>
    );
  
}

export default ShareNotesPopup;