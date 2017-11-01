import * as config from '../config/config'
import * as workflowConstants from '../config/workflow-constants'
import * as fileSystem from '../processes/file-system'
import * as encoder from '../processes/encoder'
import * as uploader from '../processes/uploader'
import { log, LogLevels } from '../processes/logger'
import * as status from './status'

export interface WorkflowOptions {
    timestamp: number
    reverseTimestamp: string
    outputDir: string
    statusURI: string
    outputType: string
    type: string
    inputURI: string
    fileName: string
    outputDirectory: string
    outputDirs: string[]
    bitrates: number[]
    outputURI: string
    files: string[]
    uploadFilePaths: string[]
    remoteFilePaths: string[]
    manifestLocation: string
    remotePaths: string[]
    signedUrls: string[]
    codec: string
    encoderOutput: string[]
    segmentSize: number
    filePaths: uploader.PathMap[]
}

interface Workflow {
    options: WorkflowOptions
    tasks: Array<(options: WorkflowOptions) => Promise<WorkflowOptions>>
}

export async function initWorkflow(options: WorkflowOptions): Promise<string> {
    const workflow = await setWorkflow(options)
    manageWorkflow(workflow)
    return workflow.options.statusURI
}

async function manageWorkflow(workflow: Workflow) {
    try {
        let options = workflow.options
        for (const task of workflow.tasks) {
            options = await task(options)
        }
        log(LogLevels.info, 'Encode workflow finished')
        status.updateStatusObject(options.statusURI, options.signedUrls, true)
    } catch (error) {
        log(LogLevels.error, error.message)
    }
}

async function setWorkflow(options: WorkflowOptions): Promise<Workflow> {
    options.timestamp = Date.now()
    options.reverseTimestamp = getReverseTimestamp()
    options.outputDir = config.OUTPUT_DIR
    options.statusURI = options.fileName + options.timestamp
    const workflow = {} as Workflow

    switch (options.type) {
        case workflowConstants.ENCODE_HLS:
            workflow.tasks = [
                fileSystem.createDirs,
                encoder.encodeVideo,
                encoder.segmentVideo,
                uploader.s3Upload
            ]
            if (config.CLEANUP) {
                workflow.tasks.push(fileSystem.cleanup)
            }
            workflow.options = options
            return workflow
        case workflowConstants.DEFAULT: {
            for (const key in config.DEFAULT_ENCODE) {
                options[key] = config.DEFAULT_ENCODE[key]
            }
            // Workflow tasks
            workflow.tasks = [
                fileSystem.createDirs,
                encoder.encodeVideo,
                encoder.segmentVideo,
                uploader.s3Upload
            ]
            if (config.CLEANUP) {
                workflow.tasks.push(fileSystem.cleanup)
            }
            workflow.options = options
            return workflow
        }
        case workflowConstants.ENCODE_VIDEO: {
            // Workflow tasks
            workflow.tasks = [
                fileSystem.createDirs,
                encoder.encodeVideo,
                uploader.s3Upload
            ]
            if (config.CLEANUP) {
                workflow.tasks.push(fileSystem.cleanup)
            }
            workflow.options = options
            return workflow
        }
        default: {
            throw new Error('Invalid workflow type')
        }
    }
}

function getReverseTimestamp() {
    const date = new Date()
    const millseconds = addZero(date.getMilliseconds() % 100)
    const seconds = addZero(date.getSeconds())
    const minutes = addZero(date.getMinutes())
    const hour = addZero(date.getHours())
    const day = addZero(date.getDate())
    const month = addZero(date.getMonth())
    const year = addZero(date.getFullYear() % 100)
    return millseconds + seconds + minutes + hour + day + month + year
}

function addZero(n) {
    return n > 9 ? '' + n : '0' + n
}