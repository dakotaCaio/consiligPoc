import { FindOptions } from "sequelize/types";
import { Op } from "sequelize";
import AppError from "../../errors/AppError";
import Message from "../../models/Message";
import Ticket from "../../models/Ticket";
import ShowTicketService from "../TicketServices/ShowTicketService"; 
import Queue from "../../models/Queue";
import ShowTicketForAdminService from "../TicketServices/ShowTicketForAdminService";

interface Request {
  ticketId: string;
  pageNumber?: string;
  queues?: number[];
}

interface Response {
  messages: Message[];
  ticket: Ticket;
  count: number;
  hasMore: boolean;
}

const ListMessagesForAdminService = async ({
  pageNumber = "1",
  ticketId,
  queues = []
}: Request): Promise<Response> => {
  const ticket = await ShowTicketForAdminService(ticketId);

  if (!ticket) {
    throw new AppError("ERR_NO_TICKET_FOUND", 404);
  }

  const limit = 20; 
  const offset = limit * (+pageNumber - 1); 

  const options: FindOptions = {
    where: {
      ticketId,
    }
  };

  if (queues.length > 0) {
    options.where["queueId"] = {
      [Op.or]: {
        [Op.in]: queues,
        [Op.eq]: null
      }
    };
  }

  const lastMessage = await Message.findOne({
    ...options,
    attributes: ["id", "read"],
    order: [
      ["createdAt", "DESC"]
    ],
    limit: 1
  })

  if (!lastMessage) {
    throw new AppError("ERR_NO_MESSAGE_FOUND", 404);
  }

  const messages = [lastMessage];

  const { count } = await Message.findAndCountAll({
    ...options,
  });

  const hasMore = count > offset + messages.length;

  return {
    messages,
    ticket,
    count,
    hasMore,
  }
};

export default ListMessagesForAdminService;
