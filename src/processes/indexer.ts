/* Copyright (C) [2003] - [2018] RealEyes Media, LLC - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by RealEyes Media, October 2018
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

/* MODULE FOR VIDEO INDEXER MANAGEMENT */


import * as path from 'path'
import * as config from '../config/config'
import * as status from '../control/status'
import { Stats } from 'fs'
import { WorkflowOptions } from '../control/workflow'
import { log, LogLevels } from './logger'
import * as request from 'request-promise-native'

const apiEndpoint = 'https://api.videoindexer.ai/'
let token
let jobId

export async function index(options: WorkflowOptions) {
    status.updateStatusObject(options.statusURI, 'Authenticating with Video Indexer')
    token = await getToken()
    log(LogLevels.info, 'got token')
    token = encodeURIComponent(token.replace(/"/g, ''))
    status.updateStatusObject(options.statusURI, 'Uploading to Video Indexer')
    const response = await uploadVideo(options)
    log(LogLevels.info, 'Uploaded to indexer')
    jobId = JSON.parse(response).id
    status.updateStatusObject(options.statusURI, 'Polling Video Indexer until completion of job...')
    options.indexerResults = await pollIndexer(options)
    const widgets = [
        `https://www.videoindexer.ai/embed/player/${config.INDEXER_ACCOUNT_ID}/${jobId}/?version=2`,
        `https://www.videoindexer.ai/embed/insights/${config.INDEXER_ACCOUNT_ID}/${jobId}/?version=2`
    ]
    options.widgets = widgets
    status.updateStatusObjectWithInsights(options.statusURI, widgets)
    return options
}

async function getToken() {
    const requestOptions: request.RequestPromiseOptions = {
        headers: {
            'Accept': 'application/json',
            'Ocp-Apim-Subscription-Key': config.INDEXER_SUBSCRIPTION_KEY
        }
    }
    log(LogLevels.info, 'requesting token')
    return await request(`${apiEndpoint}/auth/${config.INDEXER_LOCATION}/Accounts/${config.INDEXER_ACCOUNT_ID}/AccessToken` +
        `?allowEdit=true`,
        requestOptions)
}

async function uploadVideo(options: WorkflowOptions) {
    log(LogLevels.info, 'uploading to Indexer')
    const uploadedUrl = options.signedUrls[0]
    const timestamp = new Date().getTime()
    const requestOptions: request.RequestPromiseOptions = {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        qs: {
            accessToken: token,
            name: `demo-encoder${timestamp}`,
            videoUrl: uploadedUrl,
            privacy: 'Public'
        }
    }
    // The asset might not be "available" quite yet  - 30 seconds was too little.
    await sleep(60000)
    return await request.post(`${apiEndpoint}${config.INDEXER_LOCATION}/Accounts/${config.INDEXER_ACCOUNT_ID}/Videos`, requestOptions)

}

async function pollIndexer(options: WorkflowOptions) {
    return new Promise(async (resolve, reject) => {
        const interval = setInterval(async () => {
            const requestOptions: request.RequestPromiseOptions = {
                qs: {
                    accessToken: token,
                    language: 'English'
                }
            }
            const response = await request(
                `${apiEndpoint}/${config.INDEXER_LOCATION}/Accounts/${config.INDEXER_ACCOUNT_ID}/Videos/${jobId}/Index`,
                requestOptions
            )
            const parsed = JSON.parse(response)
            if (parsed.videos[0].processingProgress) {
                status.updateStatusObject(options.statusURI, 'Video Indexer progress: ' + parsed.videos[0].processingProgress)
            }
            if (parsed.state === 'Processed') {
                clearInterval(interval)
                resolve(parsed)
            }
        }, 5000)
    })
}

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

