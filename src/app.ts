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

import * as express from 'express'
import * as bodyParser from 'body-parser'
import * as cookieParser from 'cookie-parser'
import * as pinoModule from 'express-pino-logger'
import * as path from 'path'
import IndexRouter from './routes/index'
import WorkflowStatusRouter from './routes/workflow-status'
const pino = pinoModule()

// Creates and configures an ExpressJS web server.
class App {

    // ref to Express instance
    public express = express()

    // Run configuration methods on the Express instance.
    constructor() {
        this.middleware()
        this.routes()
    }
    // app.set('views', path.join(__dirname, 'client/views'));
    // app.set('view engine', 'pug');

    // // uncomment after placing your favicon in /public
    // //app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
    // app.use(logger('dev'));
    // app.use(bodyParser.json());
    // app.use(bodyParser.urlencoded({ extended: false }));
    // app.use(cookieParser());
    // app.use(express.static(path.join(__dirname, 'client/public')));
    // app.use(express.static(path.join(__dirname, 'bower_components')));
    // Configure Express middleware.
    private middleware() {
        this.express.set('views', path.join(__dirname, '../client/views'))
        this.express.set('view engine', 'pug')
        this.express.use(bodyParser.json())
        this.express.use(bodyParser.urlencoded({
            extended: false
        }))
        this.express.use(cookieParser())
        this.express.use(express.static(path.join(__dirname, '../client/public')))
        this.express.use(express.static(path.join(__dirname, '../bower_components')))
    }

    // Configure API endpoints.
    private routes() {
        const router = express.Router()
        // placeholder route handler
        router.get('/', async (req, res, next) => {
            res.json({
                message: 'Demo encoder'
            })
        })

        // Routes into application
        this.express.use('/', IndexRouter)
        this.express.use('/status', WorkflowStatusRouter)
        this.express.use('/test', router)
    }
}

export default new App().express
