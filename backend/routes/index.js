const router = require('express').Router();

router.use('/auth', require('./auth.routes'));
router.use('/speech', require('./speech.routes'));
router.use('/users', require('./users.routes'));
router.use('/files', require('./files.routes'));
router.use('/notif', require('./notification.routes'));
router.use('/notes', require('./notes.routes'));
router.use('/sharedNotes', require('./sharedNotes.routes'));

module.exports = router;