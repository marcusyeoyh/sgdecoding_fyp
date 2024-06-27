const axios = require("axios");
const Notes = require("../models/notes.model");
const { v4: uuid } = require('uuid');

async function createNotes(req,res) {
	try {
        let data = req.body;
        const title = data.title;
        const userEmail = data.userEmail;
		const newId = uuid();
        await Notes.create({
			_id: newId,
            userEmail:userEmail,
            title: title,
            text: ""
        });
        res.status(200).send();
	}
	catch (err) {
		console.log("creating notes failed");
		return err;
	}
};

async function createNewNotesWithText(req,res) {
	try {
        let data = req.body;
        const title = data.title;
        const userEmail = data.userEmail;
        const text = data.text;
		const newId = uuid();
        await Notes.create({
			_id: newId,
            userEmail:userEmail,
            title: title,
            text: text
        });
        res.status(200).send();
	}
	catch (err) {
		console.log("creating notes failed");
		return err;
	}
};

async function getUserNotes(req,res) {
	try {
        let data = req.body;
        const userEmail = data.userEmail;
        const foundNotes = await Notes.find({"userEmail":userEmail});
        return res.status(200).json(foundNotes);
	}
	catch (err) {
		return err;
	}
}

async function getOneNote(req,res) {
	try {
        let data = req.body;
        const id = data._id;
        const foundNotes = await Notes.findOne({"_id":id});
        return res.status(200).json(foundNotes);
	}
	catch (err) {
		console.log("get one note failed");
		return err;
	}
}


async function updateText(req,res) {
	try {
        let data = req.body;
        const id = data._id;
        const text = data.text;
		const filter = { _id: id };
		const update = { text: text };
		let updatedNotes = await Notes.findOneAndUpdate(filter, update, {
			returnOriginal: false
		  });

		res.status(200).json(updatedNotes);
	}
	catch (err) {
		console.log("text update failed");
		return err;
	}
};

async function updateTitle(req,res) {
	try {
        let data = req.body;
        const id = data._id;
        const title = data.title;
		const filter = { _id: id };
		const update = { title: title };
		const updatedNotes = await Notes.findOneAndUpdate(filter, update,{
			returnOriginal: false
		  });
        return res.status(200).json(updatedNotes);
	}
	catch (err) {
		console.log("update title notes failed failed");
		return err;
	}
};

async function deleteNotes(req,res) {
	try {
        let data = req.body;
        const id = data._id;
		const filter = { _id: id };
		let deleteNotes = await Notes.findOneAndRemove(filter);
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
	createNotes,
	createNewNotesWithText,
	getUserNotes,
	getOneNote,
	updateText,
	updateTitle,
	deleteNotes
}




