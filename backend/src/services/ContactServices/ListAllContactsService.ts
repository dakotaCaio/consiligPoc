import Contact from "../../models/Contact";
import AppError from "../../errors/AppError";
import { FindOptions, Model, Op } from "sequelize";
import Ticket from "../../models/Ticket";

export interface SearchContactParams {
  name?: string; 
  companyId: string | number;
}

const ListAllContactsService = async ({ name, companyId }: SearchContactParams): Promise<Contact[]> => {
  let options: FindOptions = {
    order: [['name', 'ASC']], 
    include: [
      {
        model: Ticket,
        as: "tickets",
        attributes: ["uuid"]
      }
    ]
  };

  if (name) {
    options.where = {
      name: {
        [Op.like]: `%${name}%`
      }
    };
  }

  options.where = {
    ...options.where,
    companyId
  }

  const contacts = await Contact.findAll(options);

  if (!contacts || contacts.length === 0) {
    throw new AppError("ERR_NO_CONTACT_FOUND", 404);
  }

  return contacts;
};

export default ListAllContactsService;
