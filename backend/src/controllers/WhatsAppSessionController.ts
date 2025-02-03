import { Request, Response } from "express";
import { getWbot } from "../libs/wbot";
import ShowWhatsAppService from "../services/WhatsappService/ShowWhatsAppService";
import { StartWhatsAppSession } from "../services/WbotServices/StartWhatsAppSession";
import UpdateWhatsAppService from "../services/WhatsappService/UpdateWhatsAppService";

const store = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { whatsappId } = req.params;
    const { companyId } = req.user;
    
    const whatsapp = await ShowWhatsAppService(whatsappId, companyId);
    
    if (!whatsapp) {
      return res.status(404).json({ message: "WhatsApp não encontrado." });
    }

    await StartWhatsAppSession(whatsapp, companyId);

    return res.status(200).json({ message: "Iniciando a sessão do WhatsApp." });

  } catch (error) {
    console.error("Erro ao iniciar a sessão do WhatsApp:", error);

    return res.status(500).json({
      message: "Erro ao iniciar a sessão do WhatsApp. Por favor, tente novamente.",
    });
  }
};

const update = async (req: Request, res: Response): Promise<Response> => {
  const { whatsappId } = req.params;
  const { companyId } = req.user;

  const { whatsapp } = await UpdateWhatsAppService({
    whatsappId,
    companyId,
    whatsappData: { session: "" }
  });

  await StartWhatsAppSession(whatsapp, companyId);

  return res.status(200).json({ message: "Starting session." });
};

const remove = async (req: Request, res: Response): Promise<Response> => {
  const { whatsappId } = req.params;
  const { companyId } = req.user;
  const whatsapp = await ShowWhatsAppService(whatsappId, companyId);

  if (whatsapp.session) {
    await whatsapp.update({ status: "DISCONNECTED", session: "" });
    const wbot = getWbot(whatsapp.id);
    await wbot.logout();
  }

  return res.status(200).json({ message: "Session disconnected." });
};

export default { store, remove, update };
