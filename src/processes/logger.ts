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

import * as pinoModule from 'pino'

export enum LogLevels {
    trace,
    debug,
    info,
    warn,
    error,
    fatal
}

const pinoLog = {
    0: (...args) => pino.trace(args),
    1: (...args) => pino.debug(args),
    2: (...args) => pino.info(args),
    3: (...args) => pino.warn(args),
    4: (...args) => pino.error(args),
    5: (...args) => pino.fatal(args)
}

const pino = pinoModule()

export function log(level: LogLevels, ...args) {
    pinoLog[level](args)
}
