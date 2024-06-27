
const router = require('express').Router();

const { 
	changeName,
	addUserStatistics
} = require('../controllers/users.controller');

router.post('/change-name', changeName);
router.post('/statistics', addUserStatistics);

module.exports = router;