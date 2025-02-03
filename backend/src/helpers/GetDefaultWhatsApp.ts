import AppError from "../errors/AppError";
import Whatsapp from "../models/Whatsapp";
import GetDefaultWhatsAppByUser from "./GetDefaultWhatsAppByUser";
import Company from "../models/Company";

const GetDefaultWhatsApp = async (
  companyId: number,
  userId?: number
): Promise<Whatsapp> => {
  let connection: Whatsapp;

  const defaultWhatsapp = await Whatsapp.findOne({
    where: { isDefault: true, companyId }
  });

  if (defaultWhatsapp?.status === 'CONNECTED') {
    connection = defaultWhatsapp;
  } else {
    const whatsapp = await Whatsapp.findOne({
      where: { status: "CONNECTED", companyId }
    });
    connection = whatsapp;
  }

  if (userId) {
    const whatsappByUser = await GetDefaultWhatsAppByUser(userId);
    if (whatsappByUser?.status === 'CONNECTED') {
      connection = whatsappByUser;
    } else {
      const whatsapp = await Whatsapp.findOne({
        where: { status: "CONNECTED", companyId }
      });
      connection = whatsapp;
    }
  }

  if (!connection) {
    throw new AppError(`Não há uma conexão estabelecida como padrão para a Carteira: ${Company.name}`);
  }

  return connection;
};

export default GetDefaultWhatsApp;