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

import * as http from 'http'
import App from '../app'
import { log, LogLevels } from '../processes/logger'

const port = normalizePort(process.env.PORT || 3000)
App.set('port', port)

const server = http.createServer(App)
server.listen(port)
server.on('error', onError)
server.on('listening', onListening)

function normalizePort(val: number | string): number | string | boolean {
    const port: number = (typeof val === 'string') ? parseInt(val, 10) : val
    if (isNaN(port)) return val
    else if (port >= 0) return port
    else return false
}

function onError(error: NodeJS.ErrnoException) {
    if (error.syscall !== 'listen') throw error
    const bind = (typeof port === 'string') ? 'Pipe ' + port : 'Port ' + port
    switch (error.code) {
        case 'EACCES':
            log(LogLevels.error, `${bind} requires elevated privileges`)
            process.exit(1)
            break
        case 'EADDRINUSE':
            log(LogLevels.error, `${bind} is already in use`)
            process.exit(1)
            break
        default:
            throw error
    }
}

function onListening() {
    const addr = server.address()
    const bind = (typeof addr === 'string') ? `pipe ${addr}` : `port ${addr.port}`
    log(LogLevels.info, `Listening on ${bind}`)
}
