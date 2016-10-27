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
	if (_.isError(workflow)) {
		res.status(400).json( { success: false, error: workflow } ); 
	} else {
		workflowManager(workflow);
		res.status(200).json( { success: true, statusURI: options.statusURI } );
	}
}

/* Manages all workflow tasks */
function workflowManager(workflow) {
	// Run workflow tasks
	async.waterfall(workflow.workflow, function (error, options) {
		if (error) {
			// Parent error callback
			status.updateStatusObject(workflow.statusURI, 'Error: ' + error.message, true, true);
		} else {
			// Completed Workflow
			debug('Workflow for ' + options.statusURI + ' complete');
			status.updateStatusObject(options.statusURI, options.signedUrls, true);
		}
	});
}

/* Set workflow type */
function setWorkflow(options) {
	options.timestamp = Date.now();
	options.reverseTimestamp = getReverseTimestamp();
	options.outputDir = config.outputDir;
	options.statusURI = options.fileName + options.timestamp;
	var workflow = {};
	workflow.statusURI = options.statusURI;
	switch (options.type) {
		case workflowConstants.DEFAULT: {
			for (var key in config.defaultEncode) {
				options[key] = config.defaultEncode[key];				
			}
			// Workflow tasks
			workflow.workflow = [
				fileSystem.createDirs(options),
				encoder.encodeVideo,
				uploader.s3Upload
			]
			if (config.cleanup) {
				workflow.workflow.push(fileSystem.cleanup);
			}
			return workflow
			break;
		}
		case workflowConstants.ENCODE_HLS:
		case workflowConstants.ENCODE_VIDEO: {
			// Workflow tasks
			workflow.workflow = [
				fileSystem.createDirs(options),
				encoder.encodeVideo,
				uploader.s3Upload
			]
			if (config.cleanup) {
				workflow.workflow.push(fileSystem.cleanup);
			}
			return workflow
			break;
		}
		default: {
			return new Error('Invalid workflow type');
			break;
		}
	}
}

/* Create a reverse timestamp for S3 performance */
function getReverseTimestamp() {
    var date = new Date();
    var millseconds = addZero(date.getMilliseconds() % 100);
    var seconds = addZero(date.getSeconds());
    var minutes = addZero(date.getMinutes());
    var hour = addZero(date.getHours());
    var day = addZero(date.getDate());
    var month = addZero(date.getMonth());
    var year = addZero(date.getFullYear() % 100);
    return millseconds + seconds + minutes + hour + day + month + year;
}

function addZero(n) {
    return n > 9 ? "" + n : "0" + n;
}
