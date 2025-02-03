import express from "express";
import isAuth from "../middleware/isAuth";
import { isSuper, isSuperbp, isSuperOrSuperbp } from "../middleware/isSuper";

import * as CompanyController from "../controllers/CompanyController";

const companyRoutes = express.Router();

companyRoutes.get("/companies/list", isAuth, isSuperOrSuperbp, CompanyController.list);
companyRoutes.get("/companies/byId/:companyId", isAuth, CompanyController.listCompanyId)
companyRoutes.get("/companies", isAuth, CompanyController.index);
companyRoutes.get("/companies/:id", isAuth, CompanyController.show);
companyRoutes.post("/companies", isAuth, isSuper, CompanyController.store);
companyRoutes.put("/companies/:id", isAuth, isSuper, CompanyController.update);
companyRoutes.put("/companies/:id/schedules", isAuth, CompanyController.updateSchedules);
companyRoutes.delete("/companies/:id", isAuth, isSuper, CompanyController.remove);
companyRoutes.post("/companies/cadastro", CompanyController.store);

companyRoutes.get("/companies/listPlan/:id", isAuth, CompanyController.listPlan);
companyRoutes.get("/companiesPlan", isAuth, CompanyController.indexPlan);

export default companyRoutes;