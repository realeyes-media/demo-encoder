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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const pinoModule = require("express-pino-logger");
const path = require("path");
const index_1 = require("./routes/index");
const workflow_status_1 = require("./routes/workflow-status");
const pino = pinoModule();
// Creates and configures an ExpressJS web server.
class App {
    // Run configuration methods on the Express instance.
    constructor() {
        // ref to Express instance
        this.express = express();
        this.middleware();
        this.routes();
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
    middleware() {
        this.express.set('views', path.join(__dirname, '../client/views'));
        this.express.set('view engine', 'pug');
        this.express.use(bodyParser.json());
        this.express.use(bodyParser.urlencoded({
            extended: false
        }));
        this.express.use(cookieParser());
        this.express.use(express.static(path.join(__dirname, '../client/public')));
        this.express.use(express.static(path.join(__dirname, '../bower_components')));
    }
    // Configure API endpoints.
    routes() {
        const router = express.Router();
        // placeholder route handler
        router.get('/', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            res.json({
                message: 'Demo encoder'
            });
        }));
        // Routes into application
        this.express.use('/', index_1.default);
        this.express.use('/status', workflow_status_1.default);
        this.express.use('/test', router);
    }
}
exports.default = new App().express;
//# sourceMappingURL=app.js.map