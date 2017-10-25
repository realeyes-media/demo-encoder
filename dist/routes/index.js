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
const express_1 = require("express");
const workflow_1 = require("../control/workflow");
const config = require("../config/config");
const multer = require("multer");
class IndexRouter {
    constructor() {
        this.router = express_1.Router();
        const storage = multer.diskStorage({
            destination: (req, file, cb) => {
                cb(null, `${config.LOCAL_PATH}/media`);
            },
            filename: (req, file, cb) => {
                cb(null, `${Date.now()}_${file.originalname}`);
            }
        });
        this.upload = multer({ storage: storage });
        this.initRoutes();
    }
    initRoutes() {
        this.router.get('/', this.renderIndex.bind(this));
        this.router.post('/', this.upload.single('file'), this.uploadFile.bind(this));
    }
    renderIndex(req, res, next) {
        res.render('index', { title: 'demo-encoder' });
    }
    uploadFile(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const body = req.body;
            const file = req.file;
            if (body.outputType === 'Default') {
                body.type = 'default';
            }
            else if (body.outputType === 'm3u8') {
                body.outputType = 'm3u8';
                body.type = 'encodeHls';
            }
            else if (body.outputType === 'mp4') {
                body.outputType = 'mp4';
                body.type = 'encodeVideo';
            }
            body.inputURI = file.path;
            body.fileName = file.originalname.replace(/\.[^/.]+$/, '');
            // Initialize encoding workflow
            try {
                const statusURI = yield workflow_1.initWorkflow(body);
                return res.status(200).json({ success: true, statusURI: statusURI });
            }
            catch (error) {
                res.status(400).json({ success: false, error: error.message });
            }
        });
    }
}
exports.default = new IndexRouter().router;
//# sourceMappingURL=index.js.map