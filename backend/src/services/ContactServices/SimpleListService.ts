import { Op, type FindOptions } from "sequelize";
import AppError from "../../errors/AppError";
import Contact from "../../models/Contact";
import Ticket from "../../models/Ticket";

export interface SearchContactParams {
  name?: string;
  number?: string;
  page: number;
  limit: number;
}

const SimpleListService = async ({
  name,
  number,
  page,
  limit,
  isReport = false 
}: SearchContactParams & { isReport?: boolean }): Promise<{ contacts: Contact[]; totalContacts: number }> => {
  
  // Verifique o valor do limit: Se for 0, não aplique o limite (retorne todos os registros)
  const finalLimit = limit === 0 ? undefined : (limit ? Number(limit) : 10);
  const offset = limit === 0 ? 0 : (page - 1) * finalLimit;

  let options: FindOptions = {
    order: [["name", "ASC"]],
    limit: isReport ? undefined : finalLimit,  // Se finalLimit for undefined, todos os registros serão retornados
    offset: isReport ? undefined : offset,
    include: [
      {
        model: Ticket,
        as: "tickets",
        attributes: ["uuid"]
      }
    ]
  };

  // Se houver filtros de nome ou número, aplique-os na consulta
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

  // Execute a consulta para buscar os contatos
  const contacts = await Contact.findAll(options);
  const totalContacts = await Contact.count({ where: options.where });

  // Se não houver contatos, lance um erro
  if (!contacts || contacts.length === 0) {
    throw new AppError("ERR_NO_CONTACT_FOUND", 404);
  }

  return { contacts, totalContacts };
};

export default SimpleListService;
