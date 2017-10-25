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

/* MODULE FOR ENCODING VIDEOS USING FFMPEG */

import * as ffmpeg from 'fluent-ffmpeg'
import * as constants from '../config/workflow-constants'
import * as status from '../control/status'
import { log, LogLevels } from './logger'
import { WorkflowOptions } from '../control/workflow'
import * as path from 'path'
import { ENCODER_MAP } from '../config/encoder-map'
import promisify = require('promisify-node')
const bento4 = require('fluent-bento4')({ bin: '/Users/philmoss/Downloads/Bento4-SDK-1-5-1-620.universal-apple-macosx/bin' })
import * as config from '../config/config'
const fs = promisify('fs')

interface FffmpegInput {
    inputOptions: string[]
    inputURI: string
}

interface FFmpegOutput {
    outputOptions: string[]
    outputURI: string
}

interface SegmenterData {
    assetPath: string
    localPaths: string[]
    assetName: string
    segmentDuration: number
    outputSingleFile: boolean
    hlsVersion: number
}

const paramMap = {
    assetPath: '-o',
    assetName: '--master-playlist-name=',
    segmentDuration: '--segment-duration=',
    outputSingleFile: '--output-single-file',
    hlsVersion: '--hls-version='
}

// Encode videos
export async function encodeVideo(options: WorkflowOptions): Promise<WorkflowOptions> {
    // Iterate through each bitrate
    status.updateStatusObject(options.statusURI, 'Encoding videos...')

    const ffmpegCommands = []
    options.encoderOutput = []
    options.outputDirs.forEach(async (directory, index) => {
        const input = {} as FffmpegInput
        const output = {} as FFmpegOutput
        const bitrate = options.bitrates[index]
        input.inputOptions = ['-report']

        // DEFAULT FFMPEG OPTIONS (Add whatever you'd like here, but this will use the default codecs based on output type)
        output.outputOptions = ['-threads 0', `-c:v ${ENCODER_MAP.CODEC[options.codec]}`, '-b:v ' + bitrate + 'k']
        input.inputURI = options.inputURI
        const outputURI = `${directory}/${options.fileName + options.timestamp}_${bitrate + ENCODER_MAP.OUTPUT_TYPE[options.outputType]}`
        output.outputURI = outputURI
        options.outputURI = output.outputURI

        options.encoderOutput.push(outputURI)

        ffmpegCommands.push(executeFfmpeg(input, output))
    })

    await Promise.all(ffmpegCommands)
    log(LogLevels.info, `Successfully encoded videos for ${options.statusURI}`)
    return options
}

export async function segmentVideo(options: WorkflowOptions): Promise<WorkflowOptions> {
    const data: SegmenterData = {
        localPaths: options.encoderOutput,
        assetPath: options.outputDirectory + config.HLS_DIR,
        assetName: options.fileName,
        segmentDuration: options.segmentSize,
        outputSingleFile: config.ENCODER_OPTIONS.OUTPUT_SINGLE_FILE,
        hlsVersion: config.ENCODER_OPTIONS.HLS_VERSION
    }
    const params = await setBentoParams(data)
    // const input = (data.localPaths.length > 1) ? data.localPaths.join(' ') : data.localPaths[0]
    const input = data.localPaths[0]
    console.log(input)
    console.log(params)
    await bento4.mp4hls.exec(input, params)
    return options
}

// Ffmpeg executions
async function executeFfmpeg(input, output) {
    return new Promise((resolve, reject) => {
        const startTime = Date.now()
        const inputURI = input.inputURI
        const outputURI = output.outputURI
        const inputOptions = input.inputOptions
        const outputOptions = output.outputOptions

        const ffmpegCommand = new ffmpeg()

        ffmpegCommand.addInput(inputURI)
            .inputOptions(inputOptions)
            .on('start', function (ffmpegCmd) {
                log(LogLevels.info, '### Creating stream')
            })
            .on('progress', function (progress) {
                // logger.debug( '### progress: frames encoded: ' + progress.frames )
                // Use a third function in .then to get this back
                // if(progress) deferred.notify(true)
            })
            .on('end', function () {
                const endTime = Date.now()
                log(LogLevels.info, `### ffmpeg completed after ${((endTime - startTime) / 1000)} seconds`)
                resolve()
            })
            .on('error', function (err) {
                log(LogLevels.error, err)
                reject(err)
            })
            .output(outputURI)
            .outputOptions(outputOptions)
            .run()
    })
}

async function setBentoParams(params: SegmenterData): Promise<string[]> {
    const inputParams = []
    for (const [paramKey, paramValue] of Object.entries(params)) {
        if (paramValue && paramMap[paramKey]) {
            inputParams.push(`${paramMap[paramKey]}${paramValue} `)
        }
    }

    return inputParams
}

