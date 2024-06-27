import { useEffect, useState } from 'react';
import { useDispatch } from "react-redux";

import 'quill/dist/quill.snow.css';
import { useLocation } from "react-router-dom";
import { backendSocketURL } from "../../../api/api";
import { actionCreators } from "../../../state";
import { bindActionCreators } from "redux";
import styles from './quillTextEditor.module.scss';
import { useQuill } from 'react-quilljs';

var sharedb = require('sharedb/lib/client');
var richText = require('rich-text');
sharedb.types.register(richText.type);

const QuillTextEditor = () => {
    const { quill, quillRef } = useQuill();
    const { search } = useLocation();
    const documentId = new URLSearchParams(search).get('id')!;
    const [doc, setDoc] = useState<any>();
    const dispatch = useDispatch();
    const { updateNotesState } = bindActionCreators(actionCreators, dispatch);

    useEffect(() => {
        var socket = new WebSocket(`${backendSocketURL}`);
        var connection = new sharedb.Connection(socket);
        var doc = connection.get('collaborative_community', documentId);
        setDoc(doc);        
    },[]);

    //load data
    useEffect(() => {
        if(doc==null || quill==null) return;
        doc.subscribe(function(err :any) {
            if (err) throw err;
            const data = doc.data;
            quill.setContents(data, 'api');
        });
    },[doc,quill,documentId]);

    //send changes
    useEffect(() => {
        if(doc == null || quill == null) return;
        const handler = (delta : string, oldDelta : string, source: any)=> {
            doc.subscribe(function(err :any) {
            if(source!=="user") return;
            doc.submitOp(delta, {source: quill});});

            const contents = quill.getContents().ops;
            var currText = JSON.stringify(contents);
            updateNotesState(currText);
    };
        quill.on('text-change', handler);
        
    },[doc,quill]);

    //receive changes
    useEffect(() => {
        if(doc == null || quill == null) return;
        doc.subscribe(function(err :any) {
        if (err) throw err;
            doc.on('op', function(op:any, source:any) {
                if (source !== quill) {
                quill.updateContents(op);

                const contents = quill.getContents().ops;
                var currText = JSON.stringify(contents);
                updateNotesState(currText);
                }
            });
        });
    },[doc,quill]);

  return (
    <div aria-label='quill editor' id={styles.qlEditor}>
      <div ref={quillRef} />
    </div>
  );
};


export default QuillTextEditor;

