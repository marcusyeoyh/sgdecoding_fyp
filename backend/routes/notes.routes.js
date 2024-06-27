
const router = require('express').Router();

const { 
    createNotes,
    createNewNotesWithText,
    getUserNotes,
    getOneNote,
    updateText,
    updateTitle,
    deleteNotes
} = require('../controllers/notes.controller');

router.post('/new', createNotes);
router.post('/newNote', createNewNotesWithText);
router.post('/', getUserNotes);
router.post('/oneNote', getOneNote);
router.post('/update', updateText);
router.post('/update/title', updateTitle);
router.post('/delete', deleteNotes);

module.exports = router;