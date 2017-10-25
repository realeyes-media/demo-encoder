import { Router, Request, Response, NextFunction } from 'express'
import { WorkflowOptions, initWorkflow } from '../control/workflow'
import * as config from '../config/config'
import multer = require('multer')

class IndexRouter {
    public router: Router
    public upload: multer.Instance
    constructor() {
        this.router = Router()
        const storage: multer.StorageEngine = multer.diskStorage({
            destination: (req: Request, file: Express.Multer.File, cb: Function) => {
                cb(null, `${config.LOCAL_PATH}/media`)
            },
            filename: (req: Request, file: Express.Multer.File, cb: Function) => {
                cb(null, `${Date.now()}_${file.originalname}`)
            }
        })
        this.upload = multer({ storage: storage })
        this.initRoutes()
    }

    private initRoutes() {
        this.router.get('/', this.renderIndex.bind(this))
        this.router.post('/', this.upload.single('file'), this.uploadFile.bind(this))
    }

    private renderIndex(req: Request, res: Response, next: NextFunction) {
        res.render('index', { title: 'demo-encoder' })
    }

    private async uploadFile(req: Request, res: Response, next: NextFunction) {
        const body: WorkflowOptions = req.body
        const file = req.file
        if (body.outputType === 'Default') {
            body.type = 'default'
        } else if (body.outputType === 'm3u8') {
            body.outputType = 'm3u8'
            body.type = 'encodeHls'
        } else if (body.outputType === 'mp4') {
            body.outputType = 'mp4'
            body.type = 'encodeVideo'
        }
        body.inputURI = file.path
        body.fileName = file.originalname.replace(/\.[^/.]+$/, '')

        // Initialize encoding workflow
        try {
            const statusURI = await initWorkflow(body)
            return res.status(200).json({ success: true, statusURI: statusURI })
        } catch (error) {
            res.status(400).json({ success: false, error: error.message })
        }
    }
}

export default new IndexRouter().router
