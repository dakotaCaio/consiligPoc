import { Router } from "express";
import multer from "multer";
import isAuth from "../middleware/isAuth";
import uploadConfig from "../config/upload";
import tokenAuth from "../middleware/tokenAuth";

import * as MessageController from "../controllers/MessageController";
import isAdmin from "../middleware/isAdmin";

const messageRoutes = Router();

const upload = multer(uploadConfig);

messageRoutes.get("/messages/:ticketId", isAuth, MessageController.index);
messageRoutes.get("/messages/all/:ticketId", isAuth, isAdmin, MessageController.indexAll);
messageRoutes.post("/messages/:ticketId", isAuth, upload.array("medias"), MessageController.store);
messageRoutes.delete("/messages/:messageId", isAuth, MessageController.remove);
messageRoutes.post("/api/messages/send", tokenAuth, upload.array("medias"), MessageController.send);
messageRoutes.post("/api/messages/sendBulk", tokenAuth, upload.array("medias"), MessageController.sendBulk);
messageRoutes.post("/messages/edit/:messageId", isAuth, MessageController.edit);

export default messageRoutes;
