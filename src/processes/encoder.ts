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
import * as config from '../config/config'
import * as spawn from 'cross-spawn'
const bento4 = require('fluent-bento4')({ bin: config.BENTO_PATH })
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

        if (ENCODER_MAP.CODEC[options.codec] === 'libx265') {
            output.outputOptions = ['-threads 0', `-c:v libx265`, `-preset slow`, `-x265-params profile=main:` + 
            `bitrate=${bitrate}:vbv-maxrate=${bitrate}:vbv-bufsize=${bitrate}`]
        } else {
            output.outputOptions = ['-threads 0', `-c:v ${ENCODER_MAP.CODEC[options.codec]}`, '-b:v ' + bitrate + 'k']
        }
    
        input.inputURI = options.inputURI
        const outputURI = `${directory}/${options.fileName + options.timestamp}_${bitrate}.mp4`
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
    if (ENCODER_MAP.CODEC[options.codec] === 'libx265') {
        const localPaths = await fragmentMP4(options.encoderOutput)

        await fs.mkdir(options.outputDirectory + config.HLS_DIR)
        const params = [`--output-dir=${options.outputDirectory + config.HLS_DIR}`,
         `--no-split`, `--hls`, `--force`, `--use-segment-timeline`]
            .concat(localPaths)
        await exec(`${config.BENTO_PATH}/mp4dash`, params)
    } else {
        const data: SegmenterData = {
            localPaths: options.encoderOutput,
            assetPath: options.outputDirectory + config.HLS_DIR,
            assetName: `${options.fileName}.m3u8`,
            segmentDuration: options.segmentSize,
            outputSingleFile: config.ENCODER_OPTIONS.OUTPUT_SINGLE_FILE,
            hlsVersion: config.ENCODER_OPTIONS.HLS_VERSION
        }
        const params = await setBentoParams(data)
        const input = data.localPaths
        await bento4.mp4hls.exec(input, params)
    }
    return options
}

async function fragmentMP4(inputMP4s): Promise<string[]> {
    const outputMP4s = inputMP4s.map(input => {
        const inputParts = input.split('.')
        return `${inputParts[0]}-frag.mp4`
    })

    const fragmentCommands = outputMP4s.map((output, index) => {
        return exec(`${config.BENTO_PATH}/mp4fragment`, [inputMP4s[index], output])
    })

    await Promise.all(fragmentCommands)

    return outputMP4s
}  

function exec(command: string, args: string []) {
    return new Promise((resolve, reject) => {
        const cp = spawn(command, args)

        cp.on('error', err => {
            reject(err)
        })

        cp.on('close', code => {
            log(LogLevels.info, data)
            resolve(data)
        })

        var data = ''
        cp.stdout.on('data', chunk => (data += chunk))
        // cp.stdout.on('end', () => {console.log('>>>end stdout')})

        var error = ''
        cp.stderr.on('data', chunk => (error += chunk))
        // cp.stderr.on('end', () => {console.log('>>>end stderr', error)})
    })
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
            inputParams.push(`${paramMap[paramKey]}${paramValue}`)
        }
    }

    return inputParams
}

