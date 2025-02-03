import Ticket from "../../models/Ticket";
import { Op } from "sequelize";
import User from "../../models/User";
import Contact from "../../models/Contact";
import Tag from "../../models/Tag";

const ListTicketsByQueueService = async (queueId: string, companyId: number, profile: string) => {
  const whereConditions = {
    queueId,
    ...(profile !== 'admin' && profile !== 'superbp' && { companyId })
  };

  try {
    const tickets = await Ticket.findAll({
      where: whereConditions,
      include: [
        {
          model: User,
          attributes: ['name'],
        },
        {
          model: Contact,
          attributes: ['name', 'cnpj_cpf', 'contract'],
        },
        {
          model: Tag,
          through: { attributes: [] },
        },
      ],
    });

    // Remover duplicados programaticamente, filtrando pelo ID do ticket
    const uniqueTickets = tickets.filter((ticket, index, self) =>
      index === self.findIndex((t) => t.id === ticket.id)
    );

    return uniqueTickets;
  } catch (error) {
    console.error("Erro ao listar tickets no serviço:", error);
    throw new Error("Erro ao listar tickets.");
  }
};



export default ListTicketsByQueueService;