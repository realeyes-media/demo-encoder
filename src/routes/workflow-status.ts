import { Router, Request, Response, NextFunction } from 'express'
import { statusObject } from '../control/status'

class WorkflowStatusRouter {
    public router: Router
    constructor() {
        this.router = Router()
        this.initRoutes()
    }

    private initRoutes() {
        this.router.get('/', this.renderStatus.bind(this))
        this.router.get('/poll/:statusURI', this.pollStatus.bind(this))
    }

    private renderStatus(req: Request, res: Response, next: NextFunction) {
        res.render('workflow-status')
    }

    private async pollStatus(req: Request, res: Response, next: NextFunction) {
        if (statusObject[req.params.statusURI]) {
            res.send(statusObject[req.params.statusURI])
        } else {
            res.send({ status: 'Uploading video' })
        }
    }
}

export default new WorkflowStatusRouter().router
