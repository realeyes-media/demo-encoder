"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const config = require("../config/config");
const workflowConstants = require("../config/workflow-constants");
const fileSystem = require("../processes/file-system");
const encoder = require("../processes/encoder");
const uploader = require("../processes/uploader");
const logger_1 = require("../processes/logger");
function initWorkflow(options) {
    return __awaiter(this, void 0, void 0, function* () {
        const workflow = yield setWorkflow(options);
        console.log(workflow);
        manageWorkflow(workflow);
        return workflow.options.statusURI;
    });
}
exports.initWorkflow = initWorkflow;
function manageWorkflow(workflow) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let options = workflow.options;
            for (const task of workflow.tasks) {
                options = yield task(options);
            }
            logger_1.log(logger_1.LogLevels.info, 'Encode workflow finished');
        }
        catch (error) {
            logger_1.log(logger_1.LogLevels.error, error.message);
        }
    });
}
function setWorkflow(options) {
    return __awaiter(this, void 0, void 0, function* () {
        options.timestamp = Date.now();
        options.reverseTimestamp = getReverseTimestamp();
        options.outputDir = config.OUTPUT_DIR;
        options.statusURI = options.fileName + options.timestamp;
        const workflow = {};
        switch (options.type) {
            case workflowConstants.ENCODE_HLS:
            case workflowConstants.DEFAULT: {
                for (const key in config.DEFAULT_ENCODE) {
                    options[key] = config.DEFAULT_ENCODE[key];
                }
                // Workflow tasks
                workflow.tasks = [
                    fileSystem.createDirs,
                    encoder.encodeVideo,
                    encoder.segmentVideo,
                    uploader.s3Upload
                ];
                if (config.CLEANUP) {
                    workflow.tasks.push(fileSystem.cleanup);
                }
                workflow.options = options;
                return workflow;
            }
            case workflowConstants.ENCODE_VIDEO: {
                // Workflow tasks
                workflow.tasks = [
                    fileSystem.createDirs,
                    encoder.encodeVideo,
                    uploader.s3Upload
                ];
                if (config.CLEANUP) {
                    workflow.tasks.push(fileSystem.cleanup);
                }
                workflow.options = options;
                return workflow;
            }
            default: {
                throw new Error('Invalid workflow type');
            }
        }
    });
}
function getReverseTimestamp() {
    const date = new Date();
    const millseconds = addZero(date.getMilliseconds() % 100);
    const seconds = addZero(date.getSeconds());
    const minutes = addZero(date.getMinutes());
    const hour = addZero(date.getHours());
    const day = addZero(date.getDate());
    const month = addZero(date.getMonth());
    const year = addZero(date.getFullYear() % 100);
    return millseconds + seconds + minutes + hour + day + month + year;
}
function addZero(n) {
    return n > 9 ? '' + n : '0' + n;
}
//# sourceMappingURL=workflow.js.map