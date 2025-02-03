import { Op } from "sequelize";
import { wbotMessageListener } from "./wbotMessageListener";
import wbotMonitor from "./wbotMonitor";
import Whatsapp from "../../models/Whatsapp";
import { initWASocket } from "../../libs/wbot";
import { getIO } from "../../libs/socket";

export const StartWhatsAppSession = async (
  whatsapp: Whatsapp,
  companyId: number
): Promise<void> => {
  const io = getIO();

  await whatsapp.update({ status: "OPENING" });

  try {
    const wbot = await initWASocket(whatsapp);

    const creds = wbot.authState?.creds;

    if (creds) {
      const sessionNumber = creds.me?.id.split(":")[0];

      if (sessionNumber) {
        const existingWhatsapp = await Whatsapp.findOne({
          where: {
            number: sessionNumber,
            companyId: companyId,
            id: { [Op.ne]: whatsapp.id }, 
          },
        });

        if (existingWhatsapp) {
          console.warn(`Número ${sessionNumber} já está em uso. Deletando a sessão duplicada.`);
          await existingWhatsapp.destroy();

          io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-whatsapp-session`, {
            action: "error",
            message: `Número ${sessionNumber} já está em uso na empresa.`,
            whatsAppId: existingWhatsapp.id,
          });

          throw new Error(`Número ${sessionNumber} já está em uso na empresa.`);
        }

        await whatsapp.update({
          number: sessionNumber,
        });

        io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-whatsapp-session`, {
          action: "success",
          message: `Número ${sessionNumber} atualizado para a sessão do WhatsApp.`,
        });
      } else {
        console.warn("Número do WhatsApp não encontrado em 'creds'.");

        io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-whatsapp-session`, {
          action: "warning",
          message: "Número do WhatsApp não encontrado em 'creds'.",
        });
      }
    } else {
      console.error("Credenciais ('creds') não disponíveis.");

      io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-whatsapp-session`, {
        action: "error",
        message: "Credenciais ('creds') não disponíveis.",
      });
    }

    wbotMessageListener(wbot, companyId);
    wbotMonitor(wbot, whatsapp, companyId);

  } catch (err) {
    console.error("Erro ao iniciar a sessão WhatsApp:", err);

    io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-whatsapp-session`, {
      action: "error",
      message: `Erro ao iniciar a sessão do WhatsApp: ${err.message}`,
    });

    throw new Error("Erro ao iniciar a sessão do WhatsApp. Por favor, tente novamente.");
  }
};