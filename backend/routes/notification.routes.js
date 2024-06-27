
const router = require('express').Router();

const { emailNotification
} = require('../controllers/notification.controller');

router.post('/email/:email', emailNotification);
module.exports = router;