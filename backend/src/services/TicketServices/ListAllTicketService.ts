import { Op, fn, where, col, Filterable, Includeable, Sequelize } from "sequelize";
import { startOfDay, endOfDay, parseISO } from "date-fns";
import Ticket from "../../models/Ticket";
import Contact from "../../models/Contact";
import Message from "../../models/Message";
import Queue from "../../models/Queue";
import User from "../../models/User";
import ShowUserService from "../UserServices/ShowUserService";
import Tag from "../../models/Tag";
import TicketTag from "../../models/TicketTag";
import { intersection } from "lodash";
import Whatsapp from "../../models/Whatsapp";
import Company from "../../models/Company";

interface Request {
  searchParam?: string;
  pageNumber?: string;
  status?: string;
  date?: string;
  updatedAt?: string;
  showAll?: string;
  userId: string;
  withUnreadMessages?: string;
  queueIds: number[];
  tags: number[];
  users: number[];
  companyId: number;
  isReport?: boolean;
}

interface TicketWithCpnTickets extends Ticket {
  cpnTicketsData?: { date: Date } | false; 
}

interface Response {
  tickets: TicketWithCpnTickets[];
  count: number;
  hasMore: boolean;
  cpnTicketsCount: number;
  countG: number;
}

const ListAllTicketsService = async ({
  searchParam = "",
  pageNumber = "1",
  queueIds,
  tags,
  users,
  status,
  date,
  updatedAt,
  showAll,
  userId,
  withUnreadMessages,
  companyId,
  isReport = false
}: Request): Promise<Response> => {
  let whereCondition: Filterable["where"] = {
    [Op.or]: [{ userId }, { status: ["pending", "open", "closed"] }],
  };

  let includeCondition: Includeable[] = [
    {
      model: Contact,
      as: "contact",
      attributes: ["id", "name", "number", "email", "profilePicUrl"]
    },
    {
      model: Queue,
      as: "queue",
      attributes: ["id", "name", "color"]
    },
    {
      model: User,
      as: "user",
      attributes: ["id", "name"]
    },
    {
      model: Tag,
      as: "tags",
      attributes: ["id", "name", "color"]
    },
    {
      model: Whatsapp,
      as: "whatsapp",
      attributes: ["name"]
    },
    {
      model: Company,
      as: "company",
      attributes: ["name"]
    }
  ];

  if (showAll === "true") {
    whereCondition = { queueId: { [Op.or]: [queueIds, null] } };
  }

  if (status) {
    whereCondition = { ...whereCondition, status };
  }

  if (searchParam) {
    const sanitizedSearchParam = searchParam.toLocaleLowerCase().trim();
    includeCondition = [
      ...includeCondition,
      {
        model: Message,
        as: "messages",
        attributes: ["id", "body"],
        where: {
          body: where(fn("LOWER", col("body")), "LIKE", `%${sanitizedSearchParam}%`)
        },
        required: false,
        duplicating: false
      }
    ];
    whereCondition = {
      ...whereCondition,
      [Op.or]: [
        { "$contact.name$": where(fn("LOWER", col("contact.name")), "LIKE", `%${sanitizedSearchParam}%`) },
        { "$contact.number$": { [Op.like]: `%${sanitizedSearchParam}%` } },
        { "$message.body$": where(fn("LOWER", col("body")), "LIKE", `%${sanitizedSearchParam}%`) }
      ]
    };
  }

  if (date) {
    whereCondition = {
      createdAt: {
        [Op.between]: [+startOfDay(parseISO(date)), +endOfDay(parseISO(date))]
      }
    };
  }

  if (updatedAt) {
    whereCondition = {
      updatedAt: {
        [Op.between]: [+startOfDay(parseISO(updatedAt)), +endOfDay(parseISO(updatedAt))]
      }
    };
  }

  if (withUnreadMessages === "true") {
    const user = await ShowUserService(userId);
    const userQueueIds = user.queues.map(queue => queue.id);

    whereCondition = {
      [Op.or]: [{ userId }, { status: "pending" }],
      queueId: { [Op.or]: [userQueueIds, null] },
      unreadMessages: { [Op.gt]: 0 }
    };
  }

  if (Array.isArray(tags) && tags.length > 0) {
    const ticketsTagFilter: any[] | null = [];
    for (let tag of tags) {
      const ticketTags = await TicketTag.findAll({
        where: { tagId: tag }
      });
      if (ticketTags) {
        ticketsTagFilter.push(ticketTags.map(t => t.ticketId));
      }
    }

    const ticketsIntersection: number[] = intersection(...ticketsTagFilter);

    whereCondition = {
      ...whereCondition,
      id: {
        [Op.in]: ticketsIntersection
      }
    };
  }

  if (Array.isArray(users) && users.length > 0) {
    const ticketsUserFilter: any[] | null = [];
    for (let user of users) {
      const ticketUsers = await Ticket.findAll({
        where: { userId: user }
      });
      if (ticketUsers) {
        ticketsUserFilter.push(ticketUsers.map(t => t.id));
      }
    }

    const ticketsIntersection: number[] = intersection(...ticketsUserFilter);

    whereCondition = {
      ...whereCondition,
      id: {
        [Op.in]: ticketsIntersection
      }
    };
  }

  if (companyId !== null) {
    whereCondition = { ...whereCondition, companyId };
  }

  const limit = isReport ? undefined : 40;
  const offset = limit ? limit * (+pageNumber - 1) : 0;

  const cpnTicketsCount = await Ticket.count({
    where: {
      cpnTickets: true, 
    }
  });
  
  const twentyFourHoursAgo = new Date();
  twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
  
  const countG = await Ticket.count({
    where: {
      cpnTickets: true, 
      createdAt: {
        [Op.gte]: twentyFourHoursAgo
      }
    }
  });
  

  const { count, rows: tickets } = await Ticket.findAndCountAll({
    where: whereCondition,
    include: includeCondition,
    distinct: true,
    limit,
    offset,
    order: [["updatedAt", "DESC"]],
    subQuery: false
  });

  const formattedTickets: TicketWithCpnTickets[] = tickets.map(ticket => {
    const { cpnTickets, createdAt } = ticket;

    if (cpnTickets === true) {
      (ticket as TicketWithCpnTickets).cpnTickets = { date: createdAt, value: true };
    } else {
      (ticket as TicketWithCpnTickets).cpnTickets = false;
    }
  
    return ticket as TicketWithCpnTickets;
  });
  
  const hasMore = limit && count > offset + tickets.length;

  return {
    tickets: formattedTickets,
    count,
    hasMore,
    cpnTicketsCount,
    countG,
  };
};

export default ListAllTicketsService;
