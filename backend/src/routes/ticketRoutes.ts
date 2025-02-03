import express from "express";
import isAuth from "../middleware/isAuth";

import * as TicketController from "../controllers/TicketController";
import isAdmin from "../middleware/isAdmin";
import { isAdminOrSuperbp, isSuperOrSuperbp } from "../middleware/isSuper";

const ticketRoutes = express.Router();

ticketRoutes.get("/queue/:queueId/tickets", isAuth, isSuperOrSuperbp, TicketController.listTicketsByQueue);

ticketRoutes.get("/tickets", isAuth, TicketController.index);

ticketRoutes.get("/tickets/all", isAuth, isAdmin, TicketController.listAll);

ticketRoutes.get("/tickets/list", isAuth, isAdmin, TicketController.list);

ticketRoutes.get("/tickets/:ticketId", isAuth, TicketController.show);

ticketRoutes.get("/ticket/kanban", isAuth, TicketController.kanban);

ticketRoutes.get("/tickets/u/:uuid", isAuth, TicketController.showFromUUID);

ticketRoutes.post("/tickets", isAuth, TicketController.store);

ticketRoutes.put("/tickets/:ticketId", isAuth, TicketController.update);

ticketRoutes.delete("/tickets/:ticketId", isAuth, TicketController.remove);

export default ticketRoutes;
