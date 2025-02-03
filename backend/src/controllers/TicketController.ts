import { Request, Response } from "express";
import axios from "axios";
import { getIO } from "../libs/socket";
import Ticket from "../models/Ticket";
import format from "date-fns/format";
import CreateTicketService from "../services/TicketServices/CreateTicketService";
import DeleteTicketService from "../services/TicketServices/DeleteTicketService";
import ListTicketsService from "../services/TicketServices/ListTicketsService";
import ShowTicketUUIDService from "../services/TicketServices/ShowTicketFromUUIDService";
import ShowTicketService from "../services/TicketServices/ShowTicketService";
import UpdateTicketService from "../services/TicketServices/UpdateTicketService";
import ListTicketsServiceKanban from "../services/TicketServices/ListTicketsServiceKanban";
import Contact from "../models/Contact";
import User from "../models/User";
import Tag from "../models/Tag";
import TicketTag from "../models/TicketTag";
import Company from "../models/Company";
import Message from "../models/Message";
import ListAllTicketsService from "../services/TicketServices/ListAllTicketService";
import ListTicketsByQueueService from "../services/TicketServices/ListTicketsByQueueService";
import ListAllTicketsPendingOrOpen from "../services/TicketServices/ListAllTicketsPendingOrOpen";

type IndexQuery = {
  searchParam: string;
  pageNumber: string;
  status: string;
  date: string;
  updatedAt?: string;
  showAll: string;
  withUnreadMessages: string;
  queueIds: string;
  tags: string;
  users: string;
  isReport?: string;  
};


interface TicketData {
  contactId: number;
  status: string;
  queueId: number;
  userId: number;
  whatsappId: string;
}

interface TicketResponse {
  tickets: Ticket[];  
  count: number;
}

export const index = async (req: Request, res: Response): Promise<Response> => {
  const {
    pageNumber,
    status,
    date,
    updatedAt,
    searchParam,
    showAll,
    queueIds: queueIdsStringified,
    tags: tagIdsStringified,
    users: userIdsStringified,
    withUnreadMessages
  } = req.query as IndexQuery;

  const userId = req.user.id;
  const { companyId } = req.user;

  let queueIds: number[] = [];
  let tagsIds: number[] = [];
  let usersIds: number[] = [];

  if (queueIdsStringified) {
    queueIds = JSON.parse(queueIdsStringified);
  }

  if (tagIdsStringified) {
    tagsIds = JSON.parse(tagIdsStringified);
  }

  if (userIdsStringified) {
    usersIds = JSON.parse(userIdsStringified);
  }

  const { tickets, count, hasMore, cpnTicketsCount, cpnTicketsLast24HoursCount } = await ListTicketsService({
    searchParam,
    tags: tagsIds,
    users: usersIds,
    pageNumber,
    status,
    date,
    updatedAt,
    showAll,
    userId,
    queueIds,
    withUnreadMessages,
    companyId,
  });

  return res.status(200).json({
    tickets,
    count,
    hasMore,
    cpnTicketsCount,
    cpnTicketsLast24HoursCount
  });
};

export const list = async (req: Request, res: Response): Promise<Response> => {
  const {
    status,
    date,
    updatedAt,
    searchParam,
    showAll,
    queueIds: queueIdsStringified,
    tags: tagIdsStringified,
    users: userIdsStringified,
    withUnreadMessages,
    isReport
  } = req.query as IndexQuery;

  let queueIds: number[] = [];
  let tagsIds: number[] = [];
  let usersIds: number[] = [];

  if (queueIdsStringified) {
    queueIds = JSON.parse(queueIdsStringified);
  }

  if (tagIdsStringified) {
    tagsIds = JSON.parse(tagIdsStringified);
  }

  if (userIdsStringified) {
    usersIds = JSON.parse(userIdsStringified);
  }

  const { tickets, count, hasMore, cpnTicketsCount, countG } = await ListAllTicketsService({
    searchParam,
    tags: tagsIds,
    users: usersIds,
    status,
    date,
    updatedAt,
    showAll,
    userId: null,  
    queueIds,
    withUnreadMessages,
    companyId: null,  
    isReport: isReport === "true"
  });

  return res.status(200).json({ 
    tickets, 
    count, 
    hasMore, 
    cpnTicketsCount, 
    countG,
  });
};

export const listAll = async (req: Request, res: Response): Promise<Response> => {
  const { tickets, count } = await ListAllTicketsPendingOrOpen();

  return res.status(200).json({ tickets, count });
}

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { contactId, status, userId, queueId, whatsappId} = req.body;
  const { companyId } = req.user;
  const cpnTickets = false;

  const ticket = await CreateTicketService({
    contactId,
    status,
    userId,
    companyId,
    queueId,
    whatsappId,
    cpnTickets,
  });

  const io = getIO();
  io.to(ticket.status).emit(`company-${companyId}-ticket`, {
    action: "update",
    ticket
  });
  
  return res.status(200).json(ticket);
};

export const listTicketsByQueue = async (req: Request, res: Response): Promise<Response> => {
  const { queueId } = req.params;
  const { companyId, profile } = req.user;

  console.log("Recebendo requisição para listar tickets da fila:", queueId); 

  try {
    const tickets = await ListTicketsByQueueService(queueId, companyId, profile);
    
    if (!tickets || tickets.length === 0) {
      return res.status(404).json({ message: "Nenhum ticket encontrado para essa fila." });
    }

    return res.status(200).json(tickets);
  } catch (error) {
    console.error("Erro ao listar tickets:", error); 
    return res.status(500).json({ message: "Erro ao listar tickets." });
  }
};

export const kanban = async (req: Request, res: Response): Promise<Response> => {
  const {
    pageNumber,
    status,
    date,
    updatedAt,
    searchParam,
    showAll,
    queueIds: queueIdsStringified,
    tags: tagIdsStringified,
    users: userIdsStringified,
    withUnreadMessages
  } = req.query as IndexQuery;

  const userId = req.user.id;
  const { companyId } = req.user;

  let queueIds: number[] = [];
  let tagsIds: number[] = [];
  let usersIds: number[] = [];

  if (queueIdsStringified) {
    queueIds = JSON.parse(queueIdsStringified);
  }

  if (tagIdsStringified) {
    tagsIds = JSON.parse(tagIdsStringified);
  }

  if (userIdsStringified) {
    usersIds = JSON.parse(userIdsStringified);
  }

  const { tickets, count, hasMore } = await ListTicketsServiceKanban({
    searchParam,
    tags: tagsIds,
    users: usersIds,
    pageNumber,
    status,
    date,
    updatedAt,
    showAll,
    userId,
    queueIds,
    withUnreadMessages,
    companyId
  });

  return res.status(200).json({ tickets, count, hasMore });
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { ticketId } = req.params;
  const { companyId } = req.user;

  const ticket = await Ticket.findByPk(ticketId, {
    include: [
      {
        model: Tag,
        through: { attributes: [] },
        required: false,
      },
      {
        model: TicketTag,
        where: { ticketId: ticketId },
        required: false,
        through: { attributes: [] },
      },
    ],
  });

  if (!ticket) {
    return res.status(404).json({ message: "Ticket não encontrado." });
  }
};

export const showFromUUID = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { uuid } = req.params;

  console.log("Buscando ticket com UUID:", uuid);

  const ticket: Ticket = await ShowTicketUUIDService(uuid);

  return res.status(200).json(ticket);
};

const formatMessageHistory = async (ticketId: number) => {
  const ticket = await Ticket.findByPk(ticketId);
  const lastMessageApiContent = ticket.lastMessageapi;

  const messages = await Message.findAll({
    where: {
      ticketId,
    },
    order: [['createdAt', 'ASC']] 
  });

  let messageHistory = `<b>Qtde Mensagens</b>${messages.length}</br>`;
  messageHistory += `<i>-----------Mensagens------------</i></br>`;

  let subsequentMessages = messages;

  if (lastMessageApiContent) {
    const lastMessageIndex = messages.findIndex(message => message.body === lastMessageApiContent);
    subsequentMessages = lastMessageIndex !== -1 ? messages.slice(lastMessageIndex + 1) : [];
    messageHistory = `<b>Qtde Mensagens</b>${subsequentMessages.length}</br>`;
  }

  subsequentMessages.forEach(message => {
    const origin = message.fromMe ? "Operador" : "Cliente";
    const date = format(new Date(message.createdAt), "dd/MM/yyyy HH:mm:ss");
    messageHistory += `<b>${origin}: </b>"${message.body}" - <i>${date}</i></br>`;
  });

  return messageHistory;
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  const { ticketId } = req.params;
  const ticketData: TicketData = req.body;
  const { companyId } = req.user;

  try {
    if (ticketData.status === "open" && ticketData.userId) {
      const assignedTicketsCount = await Ticket.count({
        where: {
          userId: ticketData.userId,
          status: "open"
        }
      });
      
      if (assignedTicketsCount >= 50) {
        return res.status(400).json({ 
          message: "Limite de 50 tickets atingido." 
        });
      }
    }

    const currentTicket = await Ticket.findByPk(ticketId);
    if (!currentTicket) {
      return res.status(404).json({ message: "Ticket não encontrado." });
    }

    const contact = await Contact.findByPk(currentTicket.contactId);
    if (!contact) {
      return res.status(404).json({ message: "Contato não encontrado" });
    }

    if (ticketData.status === "closed" && currentTicket.status !== "closed") {
      const cnpjCpf = contact.cnpj_cpf || "";
      const contrato = contact.contract || "";

      if (!cnpjCpf || !contrato) {
        return res.status(400).json({
          message: "O ticket não pode ser fechado sem CNPJ/CPF e Contrato preenchidos."
        });
      }

      const tags = await Tag.findAll({
        include: [{
          model: TicketTag,
          where: { ticketId: ticketId },
        }]
      });

      if(tags.length == 0) {
        return res.status(400).json({ message: "O ticket precisa ter pelo menos uma tag associada." });
      } else if (tags.length > 1) {
        return res.status(400).json({ message: "O ticket não pode ser fechado com mais de 1 tag associada." });
      }

      console.log('Tags associadas ao ticket:', tags.length);
    }

    let numeroTelefone = contact.number;

    if (numeroTelefone.length === 12) {
      numeroTelefone = `${numeroTelefone.slice(0, 4)}9${numeroTelefone.slice(4)}`;
    }

    if (numeroTelefone.length !== 13) {
      return res.status(400).json({ message: "Número de telefone inválido." });
    }

    const { ticket } = await UpdateTicketService({
      ticketData,
      ticketId,
      companyId
    });

    const idMessage = contact.idMessage;

    const messageHistory = await formatMessageHistory(Number(ticketId));

    const user = await User.findByPk(ticket.userId);
    const cpfUser = user?.cpfUser || "CPF não informado";

    const tags = await Tag.findAll({
      include: [{
        model: TicketTag,
        where: { ticketId: ticketId },
      }]
    });
    const tagNames = tags.map(tag => tag.name).join(", ");

    const idEventoFornecedor = ticket.status === "open" 
      ? "Atendimento iniciado"
      : tagNames || "Sem Tag";

    const dataEvento = new Date();
    dataEvento.setHours(dataEvento.getHours() - 3);
    const dataEventoISO = dataEvento.toISOString();

    const company = await Company.findOne({ where: { id: companyId } });
    const cdGrupoem = company ? company.cdGrupoem : null;

    const cliente = contact.name || "Nome não informado";
    const carteira = company.name || "Nome não informado";

    if (ticket.status === "closed") {
      if (!ticket.lastMessageapi) {
        ticket.lastMessageapi = ticket.lastMessage;
      }
      await ticket.save();
    }

    const io = getIO();
    io.to(ticket.status).emit(`company-${companyId}-ticket`, {
      action: "update",
      ticket
    });

    return res.status(200).json(ticket);
  } catch (error) {
    console.error("Erro ao atualizar ticket:", error);
    return res.status(500).json({ message: "Erro ao atualizar ticket." });
  }
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { ticketId } = req.params;
  const { companyId } = req.user;

  await ShowTicketService(ticketId, companyId);

  const ticket = await DeleteTicketService(ticketId);

  const io = getIO();
  io.to(ticketId)
    .to(`company-${companyId}-${ticket.status}`)
    .to(`company-${companyId}-notification`)
    .to(`queue-${ticket.queueId}-${ticket.status}`)
    .to(`queue-${ticket.queueId}-notification`)
    .emit(`company-${companyId}-ticket`, {
      action: "delete",
      ticketId: +ticketId
    });

  return res.status(200).json({ message: "ticket deleted" });
};
