import Whatsapp from "../../models/Whatsapp";
import Queue from "../../models/Queue";
import Company from "../../models/Company";
import { Op } from "sequelize";

const FindAllWhatsAppsService = async (companyId?: number): Promise<Whatsapp[]> => {
  const whereConditions: any = {};

  // Se companyId for fornecido, adiciona como condição de filtro
  if (companyId) {
    whereConditions.companyId = companyId;
  }

  const connections = await Whatsapp.findAll({
    where: whereConditions, // Condições de filtro
    order: [["name", "ASC"]], // Ordenar por nome
    include: [
      {
        model: Queue,
        as: "queues",
      },
      {
        model: Company,
        as: "company",
        required: false, // Não precisa ser obrigatório
      },
    ],
  });

  return connections;
};

export default FindAllWhatsAppsService;
