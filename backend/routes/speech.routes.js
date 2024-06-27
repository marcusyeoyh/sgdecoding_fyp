
const router = require('express').Router();
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const { uploadFile, 
	getsTranscriptionJobHistory, 
	getTranscriptionResult,
	getTranscriptionInJson
} = require('../controllers/speech.controller');

router.post('/', upload.single("file"), uploadFile);
router.get('/history', getsTranscriptionJobHistory);
router.get('/:id/result', getTranscriptionResult);
router.get('/:id/result/tojson', getTranscriptionInJson);

module.exports = router;