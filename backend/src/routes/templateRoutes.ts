import express from "express";
import isAuth from "../middleware/isAuth";

import * as TemplateController from "../controllers/TemplateController"

const templateRoutes = express.Router();

templateRoutes.post('/template/:companyId', isAuth, TemplateController.store);
templateRoutes.get('/template/:companyId', isAuth, TemplateController.list);
templateRoutes.get('/template', isAuth, TemplateController.listAll);
templateRoutes.post("/template/:companyId/download-templateHistory", isAuth, TemplateController.recordDownload);
templateRoutes.get("/template/:companyId/download-templateHistory", isAuth, TemplateController.getTemplateHistory);
templateRoutes.get("/template/:companyId/download-templateHistory/:reportId", isAuth, TemplateController.getTemplateHistoryId);
templateRoutes.get('/template/:templateId/:companyId', isAuth, TemplateController.findById);
templateRoutes.put("/template/:templateId/:companyId", isAuth, TemplateController.update);
templateRoutes.delete('/template/:templateId/:companyId', isAuth, TemplateController.remove);

export { templateRoutes };