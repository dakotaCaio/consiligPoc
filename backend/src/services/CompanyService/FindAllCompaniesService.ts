import Company from "../../models/Company";
import Plan from "../../models/Plan";
import Ticket from "../../models/Ticket";
import User from "../../models/User";
import Whatsapp from "../../models/Whatsapp";
import { Op } from "sequelize";

interface TicketWithSupportStatus extends Ticket {
  supportStatus: string;
}

const FindAllCompanyService = async (): Promise<Company[]> => {
  const companies = await Company.findAll({
    order: [["name", "ASC"]],
    include: [
      { 
        model: Plan, 
        as: "plan", 
        attributes: ["id", "name"] 
      },
      {
        model: User,
        as: "users",
        attributes: ["id", "name"],
        required: false,
        include: [
          {
            model: Ticket,
            as: "tickets", 
            required: false,
            where: {
              status: {
                [Op.or]: ["pending", "open", "closed"],
              },
            },
            attributes: ["id", "status"], 
          },
        ],
      },
      {
        model: Whatsapp,
        as: "whatsapps",
        attributes: ["id", "name", "status", "qrcode"],
      },
    ],
  });

  const statusMap: { [key: string]: string } = {
    pending: "supportPending",
    open: "supportHappening",
    finished: "supportFinished",
  };

  return companies.map((company) => {
    company.users = company.users.map((user: any) => {
      user.tickets = user.tickets.map((ticket: TicketWithSupportStatus) => ({
        ...ticket, 
        supportStatus: statusMap[ticket.status] || "unknown", 
      }));
      return user;
    });
    return company;
  });
};

export default FindAllCompanyService;
