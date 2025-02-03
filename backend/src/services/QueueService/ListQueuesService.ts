import Queue from "../../models/Queue";

interface Request {
  companyId: number | null;
}

const ListQueuesService = async ({ companyId }: Request): Promise<Queue[]> => {
  const whereConditions: any = {};
  if (companyId !== null) {
    whereConditions.companyId = companyId;
  }

  try {
    const queues = await Queue.findAll({
      where: whereConditions, 
      order: [["orderQueue", "ASC"]],  
    });

    return queues;
  } catch (error) {
    console.error("Erro ao buscar filas:", error);
    throw new Error("Erro ao listar filas.");
  }
};


export default ListQueuesService;
