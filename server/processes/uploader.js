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

/* MODULE FOR UPLOADING FILES TO STORAGE */

var _ = require('lodash');
var debug = require('debug')('demo-encoder:uploader');
var path = require('path');
var fs = require('fs');
var q = require('q');
var async = require('async');
var AWS = require('aws-sdk');
var awsConfig = require('../config/aws-config.json');
if (awsConfig.accessKeyId.length > 0) {
	AWS.config.loadFromPath(path.join(__dirname, '../config/aws-config.json' ));
}
AWS.util.date.getDate = function() {
  return new Date(new Date().getTime());
};
var s3 = new AWS.S3();
var config = require('../config/configuration.json');
var status = require('../control/status');
var bucketName = config.bucketName;

// Kick off and manage s3 upload process
exports.s3Upload = function(options, callback) {
	status.updateStatusObject(options.statusURI, 'Uploading videos to storage...');

	// List of tasks for m3u8 s3 upload
	// Collect all files, upload all files, get URLS for playback assets (m3u8s)
	async.waterfall([
		getFiles(options),
		asyncUpload,
		getRemotePaths
	], function(error, options) {
		if (error) {
			// S3 upload workflow error
			callback(error);
		} else {
			// Completed S3 uploads
			debug('Completed uploading all assets for ' + options.statusURI);
			callback(null, options);
		}
	});
}

// Find all files and create remote paths
function getFiles(options, callback) {
	return function(callback) {
		// file names
		options.files = [];
		// local paths
		options.uploadFilePaths = [];
		// remote paths
		options.remoteFilePaths = [];

		if (options.outputType === 'm3u8') {
			options.files.push(options.fileName + options.timestamp + '_manifest.m3u8');
			options.uploadFilePaths.push(options.manifestLocation);		
			options.remoteFilePaths.push(options.reverseTimestamp + '/' + options.files[0]);
		}
		async.eachOf(options.outputDirs, function(directory, key, cb) {
			fs.readdir(directory, function(err, files) {
				if (err) {
					cb(error);
				} else {
					options.files = options.files.concat(files);
					// Add remote prefix to files
					_.forEach(files, function(file, i) {
						options.remoteFilePaths.push(options.reverseTimestamp + '/' + options.bitrates[key] + '/' + file);
						options.uploadFilePaths.push(directory + '/' + file);
					});
					cb();
				}
			});
		}, function(error) {
			if (error) {
				callback(error);
			} else {
				callback(null, options);
			}
		});
	}
}

// Loop through all files and call upload function
function asyncUpload(options, callback) {
	options.remotePaths = [];

	// Loop through all files
	async.eachOf(options.uploadFilePaths, function(file, key, cb) {
		var remotePath = options.remoteFilePaths[key];

		// Add playback URLS to an array
		if (playbackUrl(file)) {
			options.remotePaths.push(remotePath)
		}

		// Call upload
		upload(file, remotePath)
		.then(function() {
			cb();
		}, function(error) {
			//Upload error
			cb(error);
		});
	}, function(error) {
		if (error) {
			// Workflow error
			callback(error);
		} else {
			// All files uploaded
			callback(null, options)
		}
	});
}

// Function for async uploading of a single file
function upload(file, remotePath) {
	var deferred = q.defer();
	var body = fs.createReadStream(file);
	var params = {Bucket: bucketName, Key: remotePath, Body: body, ContentType: getContentTypeByFile(file)}
	s3.upload(params, function(err, data) {
		if (err) {
			body.destroy();
			deferred.reject(err);
		} else {
			body.destroy();
			deferred.resolve();
		}
	});

	return deferred.promise;
}

// Get remote paths of playback URLS
function getRemotePaths(options, callback) {
	options.signedUrls = [];
	async.each(options.remotePaths, function(file, cb) {
		// Expires in 1 year (Max value)
		var params = {Bucket: bucketName, Key: file, Expires: 31556926};
		s3.getSignedUrl('getObject', params, function(err, url) {
			if (err) {
				cb(err);
			} else {
				// Successfully signed URL
				options.signedUrls.push(url);
				cb();
			}
		});
	}, function(error) {
		if (error) {
			// Workflow error
			callback(error);
		} else {
			// All urls signed
			callback(null, options);
		}
	})
}

// Helper function for content types
function getContentTypeByFile(fileName) {
  var rc = 'application/octet-stream';
  if (fileName) {
    var fn = fileName.toLowerCase();

    if (fn.indexOf('.jpg') >= 0) rc = 'image/jpg';
    else if (fn.indexOf('.gif') >= 0) rc = 'image/gif';
    else if (fn.indexOf('.vtt') >= 0) rc = 'text/vtt';
    else if (fn.indexOf('.mp4') >= 0) rc = 'video/mp4';
    else if (fn.indexOf('.flv') >= 0) rc = 'video/x-flv';
    else if (fn.indexOf('.mov') >= 0) rc = 'video/quicktime';
    else if (fn.indexOf('.avi') >= 0) rc = 'video/x-msvideo';
    else if (fn.indexOf('.wmv') >= 0) rc = 'video/x-ms-wmv';
    else if (fn.indexOf('.m3u8') >= 0) rc = 'application/x-mpegURL';
    else if (fn.indexOf('.ts') >= 0) rc = 'video/MP2T';
    else if (fn.indexOf('.json') >= 0) rc = 'application/json';
  }

  return rc;
}

// Helper function for asset types
function getAssetTypeByFile(fileName) {
  var rc = '';
  if (fileName) {
    var fn = fileName.toLowerCase();

    if (fn.indexOf('.jpg') >= 0) rc = 'jpg';
    else if (fn.indexOf('.png') >= 0) rc = 'png';
    else if (fn.indexOf('.gif') >= 0) rc = 'gif';
    else if (fn.indexOf('.vtt') >= 0) rc = 'vtt';
    else if (fn.indexOf('.mp4') >= 0) rc = 'mp4';
    else if (fn.indexOf('.flv') >= 0) rc = 'flv';
    else if (fn.indexOf('.mov') >= 0) rc = 'mov';
    else if (fn.indexOf('.avi') >= 0) rc = 'avi';
    else if (fn.indexOf('.wmv') >= 0) rc = 'wmv';
    else if (fn.indexOf('.m3u8') >= 0) rc = 'm3u8';
    else if (fn.indexOf('.ts') >= 0) rc = 'ts';
    else if (fn.indexOf('.json') >= 0) rc = 'json';
  }

  return rc;
}

// Helper function for determining playback urls
function playbackUrl(file) {
	switch (getAssetTypeByFile(file)) {
		case 'ts': {
			return false;
			break;
		}
		default: {
			return true;
			break;
		}
	}
}