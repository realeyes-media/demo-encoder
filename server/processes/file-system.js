/* MODULE FOR FS MANAGEMENT */

var fs = require('fs');
var _ = require('lodash');
var q = require('q');
var async = require('async');
var debug = require('debug')('demo-encoder:file-system');
var path = require('path');
var config = require('../config/configuration.json');
var status = require('../control/status');

// Create all directories needed for workflow
exports.createDirs = function(options, callback) {
	status.updateStatusObject(options.statusURI, 'Creating Directories');
	return function(callback) {
		options.outputDirectory = path.join(__dirname, ('../../' + options.outputDir + options.timestamp));

		// Make parent directory for workflow
		makeDirectory(options.outputDirectory)
		.then(function() {
			options.outputDirs = [];

			// Loop through bitrates
			async.each(options.bitrates, function(bitrate, cb) {
				var directory = options.outputDirectory + '/' + bitrate;
				options.outputDirs.push(directory);

				// Make bitrate directories
				makeDirectory(directory) 
				.then(function(){
					// Successfully looped through bitrates
					cb(null);
				}, function(error) {
					cb(error);
				});
			}, function(error) {
				if (error) {
					// Workflow Error
					callback(error);
				} else {
					// All directories created
					debug('Successfully created output directories');
					callback(null, options);
				}
			});
		}, function(error) {
			// Workflow Error
			callback(error);
		});
	}
}

function makeDirectory(directory) {  
	var deferred = q.defer();
  	fs.stat(directory, function(err, stats) {
	    //Check if error defined and the error code is "not exists"
	    if (err) {
		    //Create the directory, call the callback.
		    fs.mkdir(directory, function(error) {
		    	if (error) {
		    		deferred.reject(error);
		    	} else {
		    		deferred.resolve();
		    	}
		    });
	    } else {
	    	// It exists
	        deferred.resolve();
	    }
	});

  	return deferred.promise;
}