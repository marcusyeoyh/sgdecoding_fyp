import React, {useState} from 'react';
import { Modal, ModalHeader, ModalBody } from 'reactstrap';
import "./createNotesPopup.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import { bindActionCreators } from "redux";
import { RootState } from "../../state/reducers";
import { useDispatch, useSelector } from 'react-redux';
import { actionCreators } from "../../state";
import { Button,  Form, Header, Message,InputOnChangeData } from 'semantic-ui-react';
import { useForm } from 'react-hook-form';


interface Props {
  setTrigger: React.Dispatch<React.SetStateAction<boolean>>}

const CreateNotesPopup: React.FC<Props> = ({setTrigger}) => {
    const [open,setOpen] = useState(false);
    const { name, role, email, type } = useSelector((state: RootState) => state.authReducer);
    const [isError, setIsError] = useState(false);
    const dispatch = useDispatch();
    const { createNewNotes } = bindActionCreators(actionCreators, dispatch);

    const {
      handleSubmit,
      setValue,
      formState: { errors }
    } = useForm({ mode: 'onBlur' });

    const onToggle = () => {
		setOpen(!open);
	};  


  const onSubmit = async (data: { title: string }) => {
    if(data.title===null || data.title === undefined){
      setIsError(true);
    }else{
    createNewNotes(email,data.title);
    setTrigger(true);
    onToggle();
    };
	};

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>, { name, value }: InputOnChangeData) => {
		setValue(name, value);
    setIsError(false);
	};
    return (
      <div>
        <Modal contentClassName="custom-modal-style" isOpen={open} toggle={onToggle} center>
          <ModalHeader toggle={onToggle}>Create a New Notes</ModalHeader>
          <ModalBody>
          <Form
          onSubmit={handleSubmit(onSubmit as any)}
          noValidate
          role="form"
          aria-label="Login Form"
			>
				<Message
					error
					header='Login Unsuccessful'
					content='We cannot find the email and/or password that you had entered in our records. Please check and try again.'
				/>
				
				<Form.Field>
					<Form.Input
						name='title'
						label='Enter title'
						fluid
						type='title'
            required={true}
						placeholder='enter title here'
						onChange={onInputChange}
						error={isError?{
              content: 'Title cannot be empty',
              pointing: 'below',
            }:null}
						role="text"
						aria-label="Email Input"
					/>
				</Form.Field>
				<Button
					primary
					content="CREATE NOTE"
					type='submit'
					role='button'
					aria-label='Create Notes Button'
				/>
			</Form>
          </ModalBody>
        </Modal>
        </div>
    );
  
}

export default CreateNotesPopup;