/* MODULE FOR UPLOADING FILES TO STORAGE */

var _ = require('lodash');
var debug = require('debug')('demo-encoder:uploader');
var path = require('path');
var fs = require('fs');
var q = require('q');
var async = require('async');
var AWS = require('aws-sdk');
AWS.config.loadFromPath(path.join(__dirname, '../config/aws-config.json' ));
AWS.util.date.getDate = function() {
  return new Date(new Date().getTime());
};
var s3 = new AWS.S3();
var config = require('../config/configuration.json');
var bucketName = config.bucketName;

// Kick off and manage s3 upload process
exports.s3Upload = function(options, callback) {
	if (options.outputType === 'm3u8') {

		// List of tasks for m3u8 s3 upload
		// Collect all files, upload all files, get URLS for playback assets (m3u8s)
		async.waterfall([
			getHlsFiles(options),
			asyncUpload,
			getRemotePaths
		], function(error, options) {
			if (error) {
				// S3 upload workflow error
				callback(error);
			} else {
				// Completed S3 uploads
				debug('Completed uploading all assets');
				debug(options.signedUrls);
				callback(null, options);
			}
		});
	} else {

	}
}

// Find all HLS files and create remote paths
function getHlsFiles(options, callback) {
	return function(callback) {
		// file names
		options.files = [options.fileName + options.timestamp + '_manifest.m3u8'];
		// local paths
		options.uploadFilePaths = [options.manifestLocation];
		// remote paths
		options.remoteFilePaths = [options.timestamp + '/' + options.files[0]];
		async.eachOf(options.outputDirs, function(directory, key, cb) {
			fs.readdir(directory, function(err, files) {
				if (err) {
					cb(error);
				} else {
					
					options.files = options.files.concat(files);
					// Add remote prefix to files
					_.forEach(files, function(file, i) {
						options.remoteFilePaths.push(options.timestamp + '/' + options.bitrates[key] + '/' + file);
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
		case 'mp4':
		case 'm3u8': {
			return true;
			break;
		}
		default: {
			return false;
			break;
		}
	}
}