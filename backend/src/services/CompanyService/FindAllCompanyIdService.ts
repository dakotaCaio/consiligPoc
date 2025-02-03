import AppError from "../../errors/AppError";
import Company from "../../models/Company";
import Plan from "../../models/Plan";
import Ticket from "../../models/Ticket";
import User from "../../models/User";
import Whatsapp from "../../models/Whatsapp";
import { Sequelize, Op } from "sequelize";

interface TicketWithSupportStatus extends Ticket {
  supportStatus: string;
}

interface UserMinimal {
  id: string;
  profile: string;
  companyId: number;
}

const FindAllCompanyIdService = async (companyId: number, user: UserMinimal): Promise<Company[]> => {
  if (user.profile !== "admin") {
    throw new AppError("Unauthorized access", 403);
  }

  const companies = await Company.findAll({
    where: { id: companyId }, 
    order: [["name", "ASC"]],
    include: [
      { model: Plan, as: "plan", attributes: ["id", "name"] },
      {
        model: User,
        as: "users",
        attributes: ["id", "name"],
        required: false,
        include: [
          {
            model: Ticket,
            as: "tickets",
            attributes: ["status", "id"],
            required: false,
            where: {
              status: {
                [Op.or]: ["open", "pending", "finished"],
              },
            },
          },
        ],
      },
      {
        model: Whatsapp,
        as: "whatsapps",
        attributes: ["id", "name", "session", "status", "qrcode"],
      },
    ],
  });

  const statusMap: { [key: string]: string } = {
    pending: "supportPending",
    open: "supportHappening",
    finished: "supportFinished",
  };

  companies.forEach((company) => {
    company.users.forEach((user: any) => {
      user.tickets = user.tickets.map((ticket: TicketWithSupportStatus) => {
        ticket.supportStatus = statusMap[ticket.status] || "unknown";
        return ticket;
      });
    });
  });

  return companies;
};

export default FindAllCompanyIdService;
