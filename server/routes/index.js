var express = require('express');
var router = express.Router();
var workflow = require('../control/workflow');
var multer = require('multer');

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './media')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '_' + file.originalname);
  }
})

var upload = multer({ storage: storage });

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* POST encode data */
router.post('/', upload.single('file'), function(req, res, next) {
	var body = req.body;
	var file = req.file;
	if (body.outputType === 'Default') {
		body.type = 'default';
	} else if (body.outputType === 'HLS') {
		body.outputType = 'm3u8';
		body.type = 'encodeHls';
	} else if (body.outputType === 'MP4') {
		body.outputType = 'mp4';
		body.type = 'video';
	}
	body.inputURI = file.path;
	body.fileName = file.originalname.replace(/\.[^/.]+$/, "");
	workflow.workflowInit(body, res);
});

module.exports = router;
