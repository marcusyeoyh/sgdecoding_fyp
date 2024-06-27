const SharedNotes = require("../models/sharedNotes.model");
const Notes = require("../models/notes.model");
const { v4: uuid } = require('uuid');

async function createSharedNotes(req,res) {
	try {
        let data = req.body;
        const notesId = data.id;
        const foundNotes = await Notes.find({"_id":notesId});
        console.log("foundNotes createSharedNotes",foundNotes);
        if(foundNotes.length==0){
            res.status(404).send();
        }
        const userEmail = data.userEmail;
		const newId = uuid();
        await SharedNotes.create({
			_id: newId,
            userEmail:userEmail,
            notesId: notesId
        });
        res.status(200).send();
	}
	catch (err) {
		console.log("creating notes failed");
		return err;
	}
}

async function getUserSharedNotes(req,res) {
    try {
        let data = req.body;
        const userEmail = data.userEmail;
        const foundNotesObj = await SharedNotes.find({"userEmail":userEmail}, { _id:0,notesId: 1});
        var foundNotesId = foundNotesObj.map(item => item.notesId);
        const records = await Notes.find().where('_id').in(foundNotesId).exec();
        return res.status(200).json(records);
	}
	catch (err) {
		console.log("get notes failed");
		return err;
	}
}

async function deleteSharedNotes(req,res) {
	try {
        let data = req.body;
        const notesId = data._id;
        const userEmail = data.userEmail;
		const filter = { notesId: notesId, userEmail: userEmail };
		let deleteNotes = await SharedNotes.findOneAndRemove(filter);
		  if (!deleteNotes){
			res.status(404).send({'message':'notes_not_found'});
		  }else{
			res.status(200).send();
		  }
	}
	catch (err) {
		console.log("delete failed");
		return err;
	}
}

module.exports = {
	createSharedNotes,
	getUserSharedNotes,
    deleteSharedNotes,
}
