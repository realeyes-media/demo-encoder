"use strict";
/* Copyright (C) [2003] - [2017] RealEyes Media, LLC - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by RealEyes Media, June 2017
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
Object.defineProperty(exports, "__esModule", { value: true });
const pinoModule = require("pino");
var LogLevels;
(function (LogLevels) {
    LogLevels[LogLevels["trace"] = 0] = "trace";
    LogLevels[LogLevels["debug"] = 1] = "debug";
    LogLevels[LogLevels["info"] = 2] = "info";
    LogLevels[LogLevels["warn"] = 3] = "warn";
    LogLevels[LogLevels["error"] = 4] = "error";
    LogLevels[LogLevels["fatal"] = 5] = "fatal";
})(LogLevels = exports.LogLevels || (exports.LogLevels = {}));
const pinoLog = {
    0: (...args) => pino.trace(args),
    1: (...args) => pino.debug(args),
    2: (...args) => pino.info(args),
    3: (...args) => pino.warn(args),
    4: (...args) => pino.error(args),
    5: (...args) => pino.fatal(args)
};
const pino = pinoModule();
function log(level, ...args) {
    pinoLog[level](args);
}
exports.log = log;
//# sourceMappingURL=logger.js.map