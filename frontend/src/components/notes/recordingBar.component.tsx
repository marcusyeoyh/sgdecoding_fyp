import React, {useState} from 'react';
import { Modal, ModalHeader, ModalBody } from 'reactstrap';
import "./createNotesPopup.css";
import { bindActionCreators } from "redux";
import { RootState } from "../../state/reducers";
import { useDispatch, useSelector } from 'react-redux';
import { actionCreators } from "../../state";
import { Button,  Form,Input, Header, Message,InputOnChangeData } from 'semantic-ui-react';
import { useForm } from 'react-hook-form';
import { Card } from "react-bootstrap";
import styles from './recordingBar.module.scss';


interface Props {
    onRecordClick: (title:string) => void;
}  

const RecordingBar: React.FC<Props> = ({onRecordClick}) => {
	
    const {
        handleSubmit,
        setValue,
        formState: { errors }
      } = useForm({ mode: 'onBlur' });
    const [inputValue, setInputValue]= useState("");
    
  const onSubmit = async (data: { title: string }) => {
    onRecordClick(data.title);
	};

    const onInputChange = (e: React.ChangeEvent<HTMLInputElement>, { name, value }: InputOnChangeData) => {
		setValue(name, value);
        setInputValue(value);
	};

    return (
        <Card>
            <p id={styles.title}>
                Create new live recording
            </p>
        <Form
            id={styles.formGroup}
            onSubmit={handleSubmit(onSubmit as any)}
            >
            <Form.Group>
                <Form.Input
                    name='title'
                    type='title'
                    role='text'
                    id={styles.formInput}
                    width={14}
                    placeholder='Enter recording title....'
                    onChange={onInputChange}
                    aria-label='Notes title'
                    />
                <Form.Button disabled={inputValue.length===0} type='submit' role='text' icon="microphone" primary content='RECORD' aria-label='Create Note' />
            </Form.Group>
        </Form>
        </Card>
    );
};

export default RecordingBar;