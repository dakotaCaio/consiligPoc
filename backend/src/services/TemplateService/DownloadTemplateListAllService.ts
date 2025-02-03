import TemplateHistory from "../../models/TemplateHistory";

const DownloadTemplateListAllService = async (): Promise<TemplateHistory[]> => {
  const history = await TemplateHistory.findAll({
    order: [["createdAt", "DESC"]],
    logging: console.log,
  });
  
  

  return history;
};

export default DownloadTemplateListAllService;