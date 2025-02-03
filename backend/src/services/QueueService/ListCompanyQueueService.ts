import Queue from "../../models/Queue";

interface Request {
  companyId: number;
}

const ListCompanyQueuesService = async ({ companyId }: Request): Promise<Queue[]> => {
  const whereConditions = {
    companyId, 
  };

  try {
    const queues = await Queue.findAll({
      where: whereConditions,
      order: [["orderQueue", "ASC"]],
    });

    return queues;
  } catch (error) {
    console.error("Erro ao buscar filas da empresa:", error);
    throw new Error("Erro ao listar filas da empresa.");
  }
};

export default ListCompanyQueuesService;
