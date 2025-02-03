import { Request, Response } from "express";
import * as Yup from "yup";
import AppError from "../errors/AppError";
import CreateTemplateService from "../services/TemplateService/CreateTemplateService";
import ListTemplateService from "../services/TemplateService/ListTemplateService";
import DeleteTicketService from "../services/TicketServices/DeleteTicketService";
import DeleteTemplateService from "../services/TemplateService/DeleteTemplateService";
import UpdateTemplateService from "../services/TemplateService/UpdateTemplateService";
import FindTemplateByIdService from "../services/TemplateService/FindByIdTemplateService";
import Ticket from "../models/Ticket";
import { MessageData, SendMessage } from "../helpers/SendMessage";
import SendWhatsAppMessage from "../services/WbotServices/SendWhatsAppMessage";
import { logger } from "../utils/logger";
import * as Sentry from "@sentry/node";
import Template from "../models/Template";
import Whatsapp from "../models/Whatsapp";
import ListAllTemplateService from "../services/TemplateService/ListAllTemplateService";
import TemplateHistory from "../models/TemplateHistory";
import getTemplateHistoryService from "../services/TemplateService/GetTemplateHistoryService";
import getTemplateHistoryIdService from "../services/TemplateService/getTemplateHistoryIdService";
import TemplateHistoryService from "../services/TemplateService/TemplateHistoryService";

interface TemplateData {
  name: string;
  mainTemplate: string;
  retryTemplate: string;
  lastTemplate: string;
  companyId: number;
}

export const store = async (req: Request, res: Response): Promise<Response> => {
  const newTemplate: TemplateData = req.body;
  const { companyId } = req.params; 

  if (!companyId) {
    throw new AppError("ERR_COMPANY_ID_REQUIRED", 400);
  }

  const schema = Yup.object().shape({
    name: Yup.string().required("ERR_TEMPLATE_NAME_REQUIRED"),
    mainTemplate: Yup.string().required("ERR_MAIN_TEMPLATE_REQUIRED"),
    retryTemplate: Yup.string().required("ERR_RETRY_TEMPLATE_REQUIRED"),
    lastTemplate: Yup.string().required("ERR_RETRY_TEMPLATE_REQUIRED"),

  });

  try {
    await schema.validate(newTemplate);
  } catch (err: any) {
    throw new AppError(err.message);
  }

  const template = await CreateTemplateService({
    ...newTemplate,
    companyId: Number(companyId),
  });

  return res.status(200).json(template);
};

export const list = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.params;
  const { name, mainTemplate, retryTemplate, lastTemplate } = req.query;  

  if (!companyId) {
    throw new AppError("ERR_COMPANY_ID_REQUIRED", 400);
  }

  const templates = await ListTemplateService({
    name: name ? String(name) : undefined,  
    mainTemplate: mainTemplate ? String(mainTemplate) : undefined,  
    retryTemplate: retryTemplate ? String(retryTemplate) : undefined,
    lastTemplate: lastTemplate ? String(lastTemplate) : undefined,   
    companyId: Number(companyId),  
  });
  

  return res.status(200).json(templates); 
};

export const listAll = async (req: Request, res: Response): Promise<Response> => {
  const { name, mainTemplate, retryTemplate, lastTemplate } = req.query;  

  const templates = await ListAllTemplateService({
    name: name ? String(name) : undefined,  
    mainTemplate: mainTemplate ? String(mainTemplate) : undefined,  
    retryTemplate: retryTemplate ? String(retryTemplate) : undefined,
    lastTemplate: lastTemplate ? String(lastTemplate) : undefined,   
  });

  return res.status(200).json(templates); 
};

export const getTemplateHistory = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.params;

  if (!companyId) {
    throw new AppError("ERR_COMPANY_ID_REQUIRED", 400);
  }

  try {
    const history = await getTemplateHistoryService(Number(companyId));
    return res.status(200).json(history);
  } catch (error) {
    console.error("Erro ao listar históricos de download:", error);
    return res.status(500).json({ error: "Erro ao listar históricos de download" });
  }
};

export const getTemplateHistoryId = async (req: Request, res: Response): Promise<Response> => {
  const { companyId, reportId } = req.params;

  if (!companyId || !reportId) {
    return res.status(400).json({ error: "companyId e reportId são necessários" });
  }

  try {
    const history = await getTemplateHistoryIdService(Number(companyId), Number(reportId), res);

    if (!history) {
      return res.status(404).json({ error: "Arquivo não encontrado." });
    }

    return res.status(200).json({ url: history.url });
  } catch (error) {
    console.error("Erro ao listar históricos de download:", error);
    return res.status(500).json({ error: "Erro ao listar históricos de download" });
  }
};


export const recordDownload = async (req, res) => {
  const { reportName, url } = req.body; 
  const { companyId } = req.params;

  console.log("Report Name:", reportName);
  console.log("Company ID:", companyId);
  console.log("Download URL (csvContent):", url); 

  if (!companyId) {
    return res.status(400).json({ error: "Company ID é obrigatório." });
  }

  try {
    const history = await TemplateHistoryService(Number(companyId));

    if (history.length >= 3) {
      const oldestHistory = history[0];
      await TemplateHistory.destroy({
        where: { id: oldestHistory.id },
      });
    }

    await TemplateHistory.create({
      companyId,
      reportName,
      url,  
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    console.log("Enviando csvContent na resposta:", url); 
    return res.status(200).json({
      message: "Download registrado com sucesso!",
      csvContent: url, 
    });
  } catch (error) {
    console.error("Erro ao salvar o histórico de download:", error);
    return res.status(500).json({ error: "Erro ao salvar o histórico de download" });
  }
};

export const findById = async (req: Request, res: Response): Promise<Response> => {
  const { templateId } = req.params; 
  const { companyId } = req.user; 

  if (!templateId) {
    throw new AppError("Template ID is required", 400);
  }

  try {
    const { template } = await FindTemplateByIdService({
      templateId: Number(templateId),
      companyId: Number(companyId), 
    });

    if (!template) {
      throw new AppError("Template not found", 404);  
    }

    return res.status(200).json(template); 
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  const { templateId } = req.params; 
  const templateData: TemplateData = req.body; 
  const { companyId } = req.user;

  const schema = Yup.object().shape({
    name: Yup.string().optional(),
    mainTemplate: Yup.string().optional(),
    retryTemplate: Yup.string().optional(),
    lastTemplate: Yup.string().optional(),
  });

  try {
    await schema.validate(templateData);
  } catch (err: any) {
    throw new AppError(err.message);
  }

  const updatedTemplate = await UpdateTemplateService(templateId, templateData, companyId);

  return res.status(200).json(updatedTemplate);
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  const { templateId, companyId } = req.params; 
  const { companyId: userCompanyId } = req.user; 

  if (Number(companyId) !== userCompanyId) {
    throw new AppError("ERR_COMPANY_ID_MISMATCH", 403);  
  }

  const template = await DeleteTemplateService(templateId, Number(companyId));

  return res.status(200).json({ message: "Template deleted successfully", template });
};

export const handleRetryTemplate = async (ticket: Ticket) => {
  try {
    const dateNow = new Date();
    const millisecondsIn1Minute = 60000;

    const updatedAt = ticket.updatedAt;
    const timeDifference = dateNow.getTime() - updatedAt.getTime();

    if (timeDifference >= millisecondsIn1Minute) {
      const template = await Template.findByPk(ticket.templateId);

      if (template && template.retryTemplate) {
        console.log(`Disparando retryTemplate para o ticket ${ticket.id}`);
        const body = template.retryTemplate;

        const whatsapp = await Whatsapp.findByPk(ticket.whatsappId);

        if (whatsapp) {
          await SendWhatsAppMessage({ body, ticket})

          ticket.retryTemplate = true;
          await ticket.save();

          console.log(`Campo retryTemplate atualizado para true no ticket ${ticket.id}`);
        } else {
          throw new Error(`Whatsapp não encontrado para o ticket ${ticket.id}`);
        }
      }
    }
  } catch (error) {
    Sentry.captureException(error);
    logger.error(`Erro ao processar ticket ${ticket.id}: ${error.message}`);
  }
};

  export const handleLastTemplate = async (ticket: Ticket) => {
    try {
      const dateNow = new Date();
      const millisecondsIn1Minute = 60000;
  
      const updatedAt = ticket.updatedAt;
      const timeDifference = dateNow.getTime() - updatedAt.getTime();
  
      if (timeDifference >= millisecondsIn1Minute) {
        const template = await Template.findByPk(ticket.templateId);
  
        if (template && template.lastTemplate) {
          console.log(`Disparando lastTemplate para o ticket ${ticket.id}`);
          const body = template.lastTemplate;
  
          const whatsapp = await Whatsapp.findByPk(ticket.whatsappId);
  
          if (whatsapp) {
            await SendWhatsAppMessage({ body, ticket})
  
            ticket.lastTemplate = true;
            await ticket.save();
  
            console.log(`Campo lastTemplate atualizado para true no ticket ${ticket.id}`);
          } else {
            throw new Error(`Whatsapp não encontrado para o ticket ${ticket.id}`);
          }
        }
      }
    } catch (error) {
      Sentry.captureException(error);
      logger.error(`Erro ao processar ticket ${ticket.id}: ${error.message}`);
    }
};