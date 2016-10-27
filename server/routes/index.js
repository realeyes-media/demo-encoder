/* Copyright (C) [2003] - [2016] RealEyes Media, LLC - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by RealEyes Media, October 2016
 *
 * THIS CODE AND INFORMATION ARE PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND,
 * EITHER EXPRESSED OR IMPLIED,  INCLUDING BUT NOT LIMITED TO THE IMPLIED WARRANTIES
 * OF MERCHANTABILITY AND/OR FITNESS FOR A PARTICULAR PURPOSE.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of RealEyes Media, LLC and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to RealEyes Media, LLC
 * and its suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from RealEyes Media, LLC.
 */

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
		body.type = 'encodeVideo';
	}
	body.inputURI = file.path;
	body.fileName = file.originalname.replace(/\.[^/.]+$/, "");

	// Initialize encoding workflow
	workflow.workflowInit(body, res);
});

module.exports = router;
