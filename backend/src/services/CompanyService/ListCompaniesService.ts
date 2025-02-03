import { Sequelize, Op } from "sequelize";
import Company from "../../models/Company";
import Ticket from "../../models/Ticket";
import User from "../../models/User";
import Plan from "../../models/Plan";
import Whatsapp from "../../models/Whatsapp";

interface Request {
  searchParam?: string;
  pageNumber?: string;
  userCompanyId?: number;  // Adicionamos a possibilidade de filtrar por companyId
}

interface Response {
  companies: Company[];
  count: number;
  hasMore: boolean;
}

const ListCompaniesService = async ({
  searchParam = "",
  pageNumber = "1",
  userCompanyId = null, // Definir se a empresa do usuário precisa ser filtrada
}: Request): Promise<Response> => {
  // Se userCompanyId estiver presente, significa que estamos buscando a empresa do usuário
  let whereCondition = {};

  if (userCompanyId) {
    // Quando for para /companies, filtramos apenas pela empresa do usuário
    whereCondition = { id: userCompanyId };
  } else {
    // Quando for para /companies/list, realizamos a busca com base no searchParam
    whereCondition = {
      [Op.or]: [
        {
          name: Sequelize.where(
            Sequelize.fn("LOWER", Sequelize.col("name")),
            "LIKE",
            `%${searchParam.toLowerCase().trim()}%`
          )
        }
      ]
    };
  }

  const limit = 20;
  const offset = limit * (+pageNumber - 1);

  const { count, rows: companies } = await Company.findAndCountAll({
    where: whereCondition,
    limit,
    offset,
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
            required: false,
            where: {
              status: {
                [Op.or]: ["pending", "open", "closed"],
              },
            },
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

  const hasMore = count > offset + companies.length;

  return {
    companies,
    count,
    hasMore,
  };
};

export default ListCompaniesService;
