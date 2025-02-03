import { Op } from "sequelize";
import Ticket from "../../models/Ticket";

interface Response {
  tickets: Ticket[];
  count: number;
}

const ListAllTicketsPendingOrOpen = async (): Promise<Response> => {
  const where = {
    status: {
      [Op.in]: ["pending", "open"]
    }
  };

  const { count, rows: tickets } = await Ticket.findAndCountAll({
    where: where,
    order: [["updatedAt", "DESC"]],
    distinct: true,
  });

  return {
    tickets,
    count
  }
}

export default ListAllTicketsPendingOrOpen;