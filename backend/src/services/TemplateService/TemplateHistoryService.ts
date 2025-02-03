import TemplateHistory from "../../models/TemplateHistory";

const TemplateHistoryService = async (companyId: number): Promise<TemplateHistory[]> => {
  const history = await TemplateHistory.findAll({
    where: { companyId },
    order: [["createdAt", "ASC"]], 
  });

  console.log("Histórico encontrado:", history); 

  if (history.length === 0) {
    console.log("Nenhum histórico encontrado.");
  }

  return history;
};

export default TemplateHistoryService;