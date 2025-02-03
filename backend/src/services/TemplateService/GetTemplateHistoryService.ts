import TemplateHistory from "../../models/TemplateHistory";

const getTemplateHistoryService = async (companyId: number | null) => {
  try {
    const whereCondition: any = companyId ? { companyId } : {};

    const history = await TemplateHistory.findAll({
      where: whereCondition,
      order: [["createdAt", "DESC"]],
    });

    return history;
  } catch (error) {
    throw new Error("Erro ao buscar histórico de downloads: " + error.message);
  }
};

export default getTemplateHistoryService;
