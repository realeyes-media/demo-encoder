/* MODULE FOR OVERSEEING THE ENCODING WORKFLOW */

var async = require('async');
var debug = require('debug')('demo-encoder:workflow');
var encoder = require('../processes/encoder');
var uploader = require('../processes/uploader');
var _ = require('lodash');
var fileSystem = require('../processes/file-system');
var workflowConstants = require('./workflow-constants');
var config = require('../config/configuration.json');
var status = require('./status');

/* Initialize encoding workflow */
exports.workflowInit = function(options, res) {
	var workflow = setWorkflow(options);
	debug(options);
	if (_.isError(workflow)) {
		res.status(400).json( { success: false, error: workflow } ); 
	} else {
		workflowManager(workflow);
		res.status(200).render( 'workflow-status' );
	}
}

function workflowManager(workflow) {
	// Run workflow tasks
	async.waterfall(workflow, function (error, options) {
		if (error) {
			// Parent error callback
			debug(error);
		} else {
			// Completed Workflow
			debug('we did it fam');
			// Clean up ram a bit
			status.updateStatusObject(options.statusURI, options.signedUrls);
		}
	});
}

/* Set workflow type */
function setWorkflow(options) {
	options.timestamp = Date.now();
	options.outputDir = config.outputDir;
	options.statusURI = options.fileName + options.timestamp;
	switch (options.type) {
		case workflowConstants.DEFAULT: {
			for (var key in config.defaultEncode) {
				options[key] = config.defaultEncode[key];
			}
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
