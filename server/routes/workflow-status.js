var express = require('express');
var router = express.Router();
var status = require('../control/status');

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.render('workflow-status');
});

router.get('/poll/:statusURI', function(req, res, next) {
	if (status.statusObject[req.params.statusURI]) {
		res.send(status.statusObject[req.params.statusURI])
	} else {
		res.send('Uploading video');
	}
});

module.exports = router;