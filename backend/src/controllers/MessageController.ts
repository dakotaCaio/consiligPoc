import { Request, Response } from "express";
import AppError from "../errors/AppError";
import axios from 'axios';

import formatBody from "../helpers/Mustache";
import SetTicketMessagesAsRead from "../helpers/SetTicketMessagesAsRead";
import { getIO } from "../libs/socket";
import Message from "../models/Message";
import Queue from "../models/Queue";
import User from "../models/User";
import Whatsapp from "../models/Whatsapp";

import CreateOrUpdateContactService from "../services/ContactServices/CreateOrUpdateContactService";
import ListMessagesService from "../services/MessageServices/ListMessagesService";
import FindOrCreateTicketService from "../services/TicketServices/FindOrCreateTicketService";
import ShowTicketService from "../services/TicketServices/ShowTicketService";
import UpdateTicketService from "../services/TicketServices/UpdateTicketService";
import CheckContactNumber from "../services/WbotServices/CheckNumber";
import DeleteWhatsAppMessage from "../services/WbotServices/DeleteWhatsAppMessage";
import GetProfilePicUrl from "../services/WbotServices/GetProfilePicUrl";
import SendWhatsAppMedia from "../services/WbotServices/SendWhatsAppMedia";
import SendWhatsAppMessage from "../services/WbotServices/SendWhatsAppMessage";
import EditWhatsAppMessage from "../services/WbotServices/EditWhatsAppMessage";
import ListMessagesForAdminService from "../services/MessageServices/ListMessagesForAdminService";
type IndexQuery = {
  pageNumber: string;
};

type MessageData = {
  phone: string; 
  idAccount?: string;
  idMessage?: string;
  cnpjCpf?: string;    
  contract?: string;   
  text: string;
  body: string;
  fromMe: boolean;
  read: boolean;
  quotedMsg?: Message;
  number?: string;
  closeTicket?: true;
  templateId?: number;
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { ticketId } = req.params;
  const { companyId } = req.user;

  const { messages, ticket } = await ListMessagesService({
    ticketId,
    companyId
  });

  return res.json({ messages, ticket });
};


export const indexAll = async (req: Request, res: Response): Promise<Response> => {
  const { ticketId } = req.params;
  const { pageNumber } = req.query as { pageNumber: string };
  const { profile } = req.user; 

  if (profile !== "admin") {
    throw new AppError("Access denied. Only admins can access this route", 403);
  }

  const { count, messages, ticket, hasMore } = await ListMessagesForAdminService({
    pageNumber,
    ticketId,
    queues: []
  });

  return res.json({ count, messages, ticket, hasMore });
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { ticketId } = req.params;
  const { body, quotedMsg, templateId, closeTicket }: MessageData = req.body;
  const medias = req.files as Express.Multer.File[];
  const { companyId } = req.user;

  const ticket = await ShowTicketService(ticketId, companyId);

  SetTicketMessagesAsRead(ticket);

  if (medias) {
    await Promise.all(
      medias.map(async (media: Express.Multer.File, index) => {
        await SendWhatsAppMedia({ media, ticket, body: Array.isArray(body) ? body[index] : body });
      })
    );
  } else {
    const send = await SendWhatsAppMessage({ body, ticket, quotedMsg });
  }

  if (templateId || closeTicket) {
    const ticketData: any = {};

    if (templateId) {
      ticketData.templateId = templateId;
      console.log("templateId recebido:", templateId);
    }

    if (closeTicket) {
      ticketData.status = "closed"; 
      ticketData.mainTemplate = true; 
      ticketData.CPC = true; 
      ticketData.dateTemplate = new Date()
    }

    await UpdateTicketService({
      ticketId: ticket.id,
      ticketData,
      companyId,
    });
  }

  return res.send();
};


export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { messageId } = req.params;
  const { companyId } = req.user;

  const message = await DeleteWhatsAppMessage(messageId);

  const io = getIO();
  io.to(message.ticketId.toString()).emit(`company-${companyId}-appMessage`, {
    action: "update",
    message
  });

  return res.send();
};

export const send = async (req: Request, res: Response): Promise<Response> => {
  const { whatsappId } = req.params as unknown as { whatsappId: number };
  const { messages } = req.body;
  const messageData: MessageData = messages[0];

  try {
    const whatsapp = await Whatsapp.findByPk(whatsappId);

    if (!whatsapp) {
      throw new Error("Não foi possível realizar a operação");
    }

    if (!messageData.phone) {
      throw new Error("O número de telefone é obrigatório");
    }

    const numberToTest = messageData.phone;
    const body = messageData.text;

    const companyId = whatsapp.companyId;

    const CheckValidNumber = await CheckContactNumber(numberToTest, companyId);
    const number = CheckValidNumber.jid.replace(/\D/g, "");
    const profilePicUrl = await GetProfilePicUrl(number, companyId);
    const contactData = {
      name: `${number}`,
      number,
      profilePicUrl,
      isGroup: false,
      companyId
    };

    const contact = await CreateOrUpdateContactService(contactData);
    const ticket = await FindOrCreateTicketService(contact, whatsapp.id!, 0, companyId);

    if (req.files) {
      const medias = req.files as Express.Multer.File[];
      await Promise.all(
        medias.map(async (media: Express.Multer.File) => {
          await req.app.get("queues").messageQueue.add(
            "SendMessage",
            {
              whatsappId,
              data: {
                number,
                body: body ? formatBody(body, contact) : media.originalname,
                mediaPath: media.path,
                fileName: media.originalname
              }
            },
            { removeOnComplete: true, attempts: 3 }
          );
        })
      );
    } else {
      await SendWhatsAppMessage({ body: formatBody(body, contact), ticket });
    }

    if (messageData.closeTicket) {
      setTimeout(async () => {
        await UpdateTicketService({
          ticketId: ticket.id,
          ticketData: { status: "closed" },
          companyId
        });
      }, 1000);
    }

    SetTicketMessagesAsRead(ticket);

    return res.send({ mensagem: "Mensagem enviada com sucesso" });
  } catch (err: any) {
    throw new AppError(
      err.message || "Não foi possível enviar a mensagem, tente novamente em alguns instantes"
    );
  }
};


export const sendBulk = async (req: Request, res: Response): Promise<Response> => {
  const { whatsappId } = req.params as unknown as { whatsappId: number };
  const { idAccount, messages } = req.body;

  const numerosInvalidos: string[] = [];

  try {
    const whatsapp = await Whatsapp.findByPk(whatsappId);

    if (!whatsapp) {
      throw new Error("Não foi possível realizar a operação");
    }

    if (!messages || messages.length === 0) {
      throw new Error("Nenhuma mensagem foi fornecida");
    }

    for (const messageData of messages) {
      if (!messageData.phone) {
        throw new Error("O número de telefone é obrigatório");
      }

      messageData.idAccount = idAccount;

      const numberToTest = messageData.phone;
      const body = messageData.text;
      const companyId = whatsapp.companyId;

      try {
        const CheckValidNumber = await CheckContactNumber(numberToTest, companyId);
        const number = CheckValidNumber.jid.replace(/\D/g, "");
        const profilePicUrl = await GetProfilePicUrl(number, companyId);

        const contactData = {
          name: `${number}`,
          number,
          profilePicUrl,
          isGroup: false,
          companyId,
          cnpj_cpf: messageData.cnpjCpf,
          contract: messageData.contract,
          idMessage: messageData.idMessage,
          idAccount: messageData.idAccount,
        };

        const contact = await CreateOrUpdateContactService(contactData);
        const ticket = await FindOrCreateTicketService(contact, whatsapp.id!, 0, companyId);

        await SendWhatsAppMessage({ body: formatBody(body, contact), ticket });
        await ticket.update({
          lastMessage: body,
        });

        if (messageData.closeTicket) {
          setTimeout(async () => {
            await UpdateTicketService({
              ticketId: ticket.id,
              ticketData: { status: "closed" },
              companyId
            });
          }, 1000);
        }

        SetTicketMessagesAsRead(ticket);

        const dataEvento = new Date();
        dataEvento.setHours(dataEvento.getHours() - 5);

      } catch (err) {
        numerosInvalidos.push(numberToTest);
      }
    }

    return res.send({ mensagem: "Mensagens enviadas com sucesso e callbacks disparados", numerosInvalidos});
  } catch (err: any) {
    throw new AppError(err.message || "Não foi possível enviar as mensagens, tente novamente em alguns instantes");
  }
};

export const edit = async (req: Request, res: Response): Promise<Response> => {
  const { messageId } = req.params;
  const { companyId } = req.user;
  const { body }: MessageData = req.body;
  const { ticket , message } = await EditWhatsAppMessage({messageId, body});

  const io = getIO();
 io.emit(`company-${companyId}-appMessage`, {
    action:"update",
    message,
    ticket: ticket,
    contact: ticket.contact,
  });

  return res.send();
}