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
const status_1 = require("../control/status");
class WorkflowStatusRouter {
    constructor() {
        this.router = express_1.Router();
        this.initRoutes();
    }
    initRoutes() {
        this.router.get('/', this.renderStatus.bind(this));
        this.router.get('/poll/:statusURI', this.pollStatus.bind(this));
    }
    renderStatus(req, res, next) {
        res.render('workflow-status');
    }
    pollStatus(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            if (status_1.statusObject[req.params.statusURI]) {
                res.send(status_1.statusObject[req.params.statusURI]);
            }
            else {
                res.send({ status: 'Uploading video' });
            }
        });
    }
}
exports.default = new WorkflowStatusRouter().router;
//# sourceMappingURL=workflow-status.js.map