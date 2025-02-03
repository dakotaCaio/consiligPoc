import { Router } from "express";
import isAuth from "../middleware/isAuth";
import multer from "multer";
import uploadConfig from "../config/upload";

const upload = multer(uploadConfig);

import * as QueueController from "../controllers/QueueController";
import { isSuperOrSuperbp } from "../middleware/isSuper";
import isAdmin from "../middleware/isAdmin";

const queueRoutes = Router();

queueRoutes.get("/queue", isAuth, isAdmin, QueueController.index);

queueRoutes.get("/queue/company", isAuth, QueueController.queueCompany);

queueRoutes.post("/queue", isAuth, QueueController.store);

queueRoutes.get("/queue/:queueId", isAuth, QueueController.show);

queueRoutes.put("/queue/:queueId", isAuth, QueueController.update);

queueRoutes.delete("/queue/:queueId", isAuth, QueueController.remove);

queueRoutes.post(
    "/queue/:queueId/media-upload",
    isAuth,
    upload.array("file"),
    QueueController.mediaUpload
  );
  
queueRoutes.delete(
    "/queue/:queueId/media-upload",
    isAuth,
    QueueController.deleteMedia
  );

export default queueRoutes;
