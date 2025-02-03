import { Op, type FindOptions } from "sequelize";
import Contact from "../../models/Contact";
import Ticket from "../../models/Ticket";

interface Request {
  name?: string;
  number?: string;
  page: number;
  limit: number;
  companyId: number;
  isReport?: boolean;
}

interface Response {
  contacts: Contact[];
  totalContacts: number;
}

const ListContactsService = async ({
  name,
  number,
  page,
  limit,
  companyId,
  isReport = false 
}: Request): Promise<Response> => {
  const finalLimit = limit === 0 ? 9999 : (limit ? Number(limit) : 10);
  const offset = limit === 0 ? 0 : (page - 1) * finalLimit;

  let options: FindOptions = {
    order: [["name", "ASC"]],
    limit: isReport ? undefined : finalLimit,
    offset: isReport ? undefined : offset,
    include: [
      {
        model: Ticket,
        as: "tickets",
        attributes: ["uuid"]
      }
    ],
    where: {
      companyId: companyId as any,
    },
  };

  if (name || number) {
    options.where = {
      ...options.where,
      ...(name && {
        name: {
          [Op.iLike]: `%${name}%`
        }
      }),
      ...(number && {
        number: {
          [Op.iLike]: `%${number}%`
        }
      }),
    };
  }

  const contacts = await Contact.findAll(options);
  const totalContacts = await Contact.count({ where: options.where });

  return { contacts, totalContacts };
};

export default ListContactsService;
