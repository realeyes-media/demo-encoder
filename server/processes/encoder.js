/* MODULE FOR ENCODING VIDEOS USING FFMPEG */

var ffmpeg = require('fluent-ffmpeg');
var _ = require('lodash');
var async = require('async');
var q = require('q');
var constants = require('../control/workflow-constants');
var status = require('../control/status');
var debug = require('debug')('demo-encoder:encoder');
var path = require('path');
var fs = require('fs');

// Encode HLS videos
exports.encodeHls = function(options, callback) {
	// Iterate through each bitrate
	status.updateStatusObject(options.statusURI, 'Encoding videos')
	async.eachOf(options.outputDirs, function(directory, key, cb) {

		// Set up ffmpeg options for HLS encode
		var input = {};
		var output = {};
		var bitrate = options.bitrates[key];
		input.inputOptions = ['-report'];
		output.outputOptions = ["-hls_time 8", "-hls_list_size 0", "-bsf:v h264_mp4toannexb", "-threads 0"];
		input.inputURI = path.join(__dirname, '../../' + options.inputURI);
		output.outputURI = directory + '/' + options.fileName + options.timestamp + '_' + bitrate + '.' + options.outputType;
		options.outputURI = output.outputURI;
		output.outputOptions.push('-b:v ' + bitrate + 'k', '-r ' + options.fps);

		// Use options to call ffmpeg executions in parallel
		executeFfmpeg(input, output)
		.then(function(data) {
			// Encode finished
			cb();
		}, function(error) {
			// Encode Error
			cb(error);
		});
	}, function(error) {
		if (error) {
			// Workflow Error
			callback(error);
		} else {
			// All encodes finished
			debug("Successfully encoded videos");
			createManifest(options)
			.then(function(options) {
				callback(null, options);
			}, function(error) {
				callback(error);
			})
		}
	});
}

// Ffmpeg executions
function executeFfmpeg(input, output) {
	var deferred = q.defer();
	var startTime = Date.now()
    var inputURI = input.inputURI;
    var outputURI = output.outputURI;
    var inputOptions = input.inputOptions;
    var outputOptions = output.outputOptions;

    var ffmpegCommand = new ffmpeg();

    ffmpegCommand.addInput(inputURI)
		.inputOptions(inputOptions)
		.on('start', function(ffmpegCmd) {
			debug('### Creating stream');
		})
		.on('progress', function(progress) {
			// logger.debug( '### progress: frames encoded: ' + progress.frames );
			// Use a third function in .then to get this back
			// if(progress) deferred.notify(true);
		})
		.on('end', function() {
			var endTime = Date.now();
			debug('### ffmpeg completed after ' + ((endTime - startTime) / 1000) + ' seconds');
			deferred.resolve('success!');
		})
		.on('error', function(err) {
			debug(err);
			deferred.reject(err);
		})
		.output(outputURI)
		.outputOptions(outputOptions)
        .run();

    return deferred.promise;
}

// Create manifest.m3u8 
function createManifest(options) {
	var deferred = q.defer();
	var bitrates = options.bitrates;
	options.manifestLocation = options.outputDirectory + '/' + options.fileName + options.timestamp + '_manifest.m3u8';
	var manifestString = "#EXTM3U"

	// Write manifest text data
	_.forEach(bitrates, function(bitrate, i) {
		manifestString += "\n#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=" + bitrate + "\n" + bitrate + '/' + options.fileName + options.timestamp + '_' + bitrate + '.m3u8';
	});

	// Create manifest file
	fs.writeFile(options.manifestLocation, manifestString, function(err) {
		if (err) {
			deferred.reject(err);
		} else {
			deferred.resolve(options);	
		}
	});
	return deferred.promise;
}

