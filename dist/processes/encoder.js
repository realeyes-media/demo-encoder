"use strict";
/* Copyright (C) [2003] - [2016] RealEyes Media, LLC - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by RealEyes Media, October 2016
 *
 * THIS CODE AND INFORMATION ARE PROVIDED 'AS IS' WITHOUT WARRANTY OF ANY KIND,
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
/* MODULE FOR ENCODING VIDEOS USING FFMPEG */
const ffmpeg = require("fluent-ffmpeg");
const status = require("../control/status");
const logger_1 = require("./logger");
const encoder_map_1 = require("../config/encoder-map");
const promisify = require("promisify-node");
const bento4 = require('fluent-bento4')({ bin: '/Users/philmoss/Downloads/Bento4-SDK-1-5-1-620.universal-apple-macosx/bin' });
const config = require("../config/config");
const fs = promisify('fs');
const paramMap = {
    assetPath: '-o',
    assetName: '--master-playlist-name=',
    segmentDuration: '--segment-duration=',
    outputSingleFile: '--output-single-file',
    hlsVersion: '--hls-version='
};
// Encode videos
function encodeVideo(options) {
    return __awaiter(this, void 0, void 0, function* () {
        // Iterate through each bitrate
        status.updateStatusObject(options.statusURI, 'Encoding videos...');
        const ffmpegCommands = [];
        options.encoderOutput = [];
        options.outputDirs.forEach((directory, index) => __awaiter(this, void 0, void 0, function* () {
            const input = {};
            const output = {};
            const bitrate = options.bitrates[index];
            input.inputOptions = ['-report'];
            // DEFAULT FFMPEG OPTIONS (Add whatever you'd like here, but this will use the default codecs based on output type)
            output.outputOptions = ['-threads 0', `-c:v ${encoder_map_1.ENCODER_MAP.CODEC[options.codec]}`, '-b:v ' + bitrate + 'k'];
            input.inputURI = options.inputURI;
            const outputURI = `${directory}/${options.fileName + options.timestamp}_${bitrate + encoder_map_1.ENCODER_MAP.OUTPUT_TYPE[options.outputType]}`;
            output.outputURI = outputURI;
            options.outputURI = output.outputURI;
            options.encoderOutput.push(outputURI);
            ffmpegCommands.push(executeFfmpeg(input, output));
        }));
        yield Promise.all(ffmpegCommands);
        logger_1.log(logger_1.LogLevels.info, `Successfully encoded videos for ${options.statusURI}`);
        return options;
    });
}
exports.encodeVideo = encodeVideo;
function segmentVideo(options) {
    return __awaiter(this, void 0, void 0, function* () {
        const data = {
            localPaths: options.encoderOutput,
            assetPath: options.outputDirectory + config.HLS_DIR,
            assetName: options.fileName,
            segmentDuration: options.segmentSize,
            outputSingleFile: config.ENCODER_OPTIONS.OUTPUT_SINGLE_FILE,
            hlsVersion: config.ENCODER_OPTIONS.HLS_VERSION
        };
        const params = yield setBentoParams(data);
        // const input = (data.localPaths.length > 1) ? data.localPaths.join(' ') : data.localPaths[0]
        const input = data.localPaths[0];
        console.log(input);
        console.log(params);
        yield bento4.mp4hls.exec(input, params);
        return options;
    });
}
exports.segmentVideo = segmentVideo;
// Ffmpeg executions
function executeFfmpeg(input, output) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();
            const inputURI = input.inputURI;
            const outputURI = output.outputURI;
            const inputOptions = input.inputOptions;
            const outputOptions = output.outputOptions;
            const ffmpegCommand = new ffmpeg();
            ffmpegCommand.addInput(inputURI)
                .inputOptions(inputOptions)
                .on('start', function (ffmpegCmd) {
                logger_1.log(logger_1.LogLevels.info, '### Creating stream');
            })
                .on('progress', function (progress) {
                // logger.debug( '### progress: frames encoded: ' + progress.frames )
                // Use a third function in .then to get this back
                // if(progress) deferred.notify(true)
            })
                .on('end', function () {
                const endTime = Date.now();
                logger_1.log(logger_1.LogLevels.info, `### ffmpeg completed after ${((endTime - startTime) / 1000)} seconds`);
                resolve();
            })
                .on('error', function (err) {
                logger_1.log(logger_1.LogLevels.error, err);
                reject(err);
            })
                .output(outputURI)
                .outputOptions(outputOptions)
                .run();
        });
    });
}
function setBentoParams(params) {
    return __awaiter(this, void 0, void 0, function* () {
        const inputParams = [];
        for (const [paramKey, paramValue] of Object.entries(params)) {
            if (paramValue && paramMap[paramKey]) {
                inputParams.push(`${paramMap[paramKey]}${paramValue} `);
            }
        }
        return inputParams;
    });
}
//# sourceMappingURL=encoder.js.map