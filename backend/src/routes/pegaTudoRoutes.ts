import express from "express";
import isAuth from "../middleware/isAuth";

import * as PegaTudoController from "../controllers/PegaTudoController"

const tudoRoute = express.Router();

tudoRoute.get("/tudo", PegaTudoController.list);
tudoRoute.get("/closed", PegaTudoController.closed);
tudoRoute.get("/pdf/:number", PegaTudoController.pdf);

export default tudoRoute;