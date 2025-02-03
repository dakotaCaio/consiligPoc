import { getIO } from "../../libs/socket";
import Contact from "../../models/Contact";
import ContactCustomField from "../../models/ContactCustomField";
import { isNil } from "lodash";

interface ExtraInfo extends ContactCustomField {
  name: string;
  value: string;
}

interface Request {
  name: string;
  number: string;
  isGroup: boolean;
  email?: string;
  cnpj_cpf?: string;
  contract?: string;
  idMessage?: string;
  idAccount?: string;
  profilePicUrl?: string;
  companyId: number;
  extraInfo?: ExtraInfo[];
  whatsappId?: number;
}

const CreateOrUpdateContactService = async ({
  name,
  number: rawNumber,
  profilePicUrl,
  isGroup,
  email = "",
  cnpj_cpf = "",
  contract = "",
  idMessage = "",
  idAccount = "", 
  companyId,
  extraInfo = [],
  whatsappId
}: Request): Promise<Contact> => {
  const number = isGroup ? rawNumber : rawNumber.replace(/[^0-9]/g, "");

  const io = getIO();
  let contact: Contact | null;

  contact = await Contact.findOne({
    where: {
      number,
      companyId
    }
  });

  if (contact) {
    await contact.update({
      profilePicUrl: profilePicUrl || contact.profilePicUrl,
      email: email || contact.email,
      cnpj_cpf: cnpj_cpf || contact.cnpj_cpf,
      contract: contract || contact.contract,
      idMessage: idMessage || contact.idMessage,
      idAccount: idAccount || contact.idAccount,
      whatsappId: isNil(contact.whatsappId) ? whatsappId : contact.whatsappId
    });

    io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-contact`, {
      action: "update",
      contact
    });
  } else {
    contact = await Contact.create({
      name,
      number,
      profilePicUrl,
      email,
      cnpj_cpf,
      contract,
      idMessage,
      idAccount,
      isGroup,
      extraInfo,
      companyId,
      whatsappId
    });

    io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-contact`, {
      action: "create",
      contact
    });
  }

  return contact;
};

export default CreateOrUpdateContactService;
