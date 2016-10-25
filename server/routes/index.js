var express = require('express');
var router = express.Router();
var workflow = require('../control/workflow');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* POST encode data */
router.post('/', function(req, res, next) {
	var body = req.body;
	workflow.workflowInit(body, res);
});

module.exports = router;
