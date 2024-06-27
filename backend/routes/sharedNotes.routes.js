
const router = require('express').Router();

const { 
    createSharedNotes,
    getUserSharedNotes,
    deleteSharedNotes,
} = require('../controllers/sharedNotes.controller');

router.post('/new', createSharedNotes);
router.post('/', getUserSharedNotes);
router.post('/delete', deleteSharedNotes);


module.exports = router;