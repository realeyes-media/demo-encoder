/* MODULE FOR OVERSEEING THE ENCODING WORKFLOW */

var async = require('async');
var _ = require('lodash');
var debug = require('debug')('demo-encoder:workflow');
var encoder = require('../processes/encoder');
var uploader = require('../processes/uploader');
var fileSystem = require('../processes/file-system');
var workflowConstants = require('./workflow-constants');
var config = require('../config/configuration.json');

/* Initialize encoding workflow */
exports.workflowInit = function(options, res) {
	var workflow = setWorkflow(options);
	if (_.isError(workflow)) {
		res.status(400).json( { success: false, error: workflow } ); 
	} else {
		workflowManager(workflow);
		res.status(200).json( { success: true } );
	}
}

function workflowManager(workflow) {
	// Run workflow tasks
	async.waterfall(workflow, function (error, options) {
		if (error) {
			debug(error);
		} else {
			debug('we did it fam');
			// Clean up ram a bit
			options = {};
		}
	});
}

/* Set workflow type */
function setWorkflow(options) {
	options.timestamp = Date.now();
	switch (options.type) {
		case workflowConstants.DEFAULT: {
			options = config.defaultEncode;
			options.timestamp = Date.now();
			// Workflow tasks
			return [
				fileSystem.createDirs(options),
				encoder.encodeHls,
				uploader.s3Upload
			]
			break;
		}
		case workflowConstants.ENCODE_HLS: {
			options.outputType = 'm3u8';
			return [
				fileSystem.createDirs(options),
				encoder.encodeHls,
				uploader.s3Upload
			]
			break;
		}
		default: {
			return new Error('Invalid workflow type');
			break;
		}
	}
}
