import TemplateHistory from "../../models/TemplateHistory";

export const getTemplateHistoryIdService = async (companyId: number, reportId: number, res) => {
  try {
    console.log(`Procurando histórico para CompanyID: ${companyId}, ReportID: ${reportId}`);

    const history = await TemplateHistory.findOne({
      where: {
        companyId,
        id: reportId,
      },
    });

    if (!history || !history.url) {
      console.log("Histórico não encontrado ou sem conteúdo URL.");
      return res.status(404).json({ error: "Histórico não encontrado" });
    }

    console.log("Histórico encontrado:", history);

    return res.status(200).json({
      csvContent: history.url, 
    });
  } catch (error) {
    console.error("Erro ao listar históricos de download:", error);
    return res.status(500).json({ error: "Erro ao listar históricos de download" });
  }
};


export default getTemplateHistoryIdService;