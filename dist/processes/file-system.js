"use strict";
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
/* MODULE FOR FS MANAGEMENT */
const promisify = require("promisify-node");
const path = require("path");
const status = require("../control/status");
const logger_1 = require("./logger");
const fs = promisify('fs');
const rimraf = promisify('rimraf');
// Create all directories needed for workflow
function createDirs(options) {
    return __awaiter(this, void 0, void 0, function* () {
        status.updateStatusObject(options.statusURI, 'Creating Directories...');
        options.outputDirectory = path.join(__dirname, ('../../' + options.outputDir + options.timestamp));
        // Make parent directory for workflow
        yield makeDirectory(options.outputDirectory);
        options.outputDirs = [];
        options.bitrates.forEach((bitrate) => __awaiter(this, void 0, void 0, function* () {
            const directory = `${options.outputDirectory}/${bitrate}`;
            options.outputDirs.push(directory);
            yield makeDirectory(directory);
        }));
        return options;
    });
}
exports.createDirs = createDirs;
// Cleanup local media directory
function cleanup(options) {
    return __awaiter(this, void 0, void 0, function* () {
        status.updateStatusObject(options.statusURI, 'Finishing up...');
        // Array of files to clean, there's probably a better way to dynamically cleanup than this
        const cleanupArray = [path.join(__dirname, '../../' + options.inputURI), options.outputDirectory];
        cleanupArray.forEach((directory) => __awaiter(this, void 0, void 0, function* () {
            yield rimraf(directory);
            logger_1.log(logger_1.LogLevels.info, `cleaned up: ${directory}`);
        }));
        return options;
    });
}
exports.cleanup = cleanup;
// Creates a directory if it doesn't exist
function makeDirectory(directory) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!(fs.existsSync(directory))) {
            yield fs.mkdir(directory);
        }
        return;
    });
}
//# sourceMappingURL=file-system.js.map