import Template from "../../models/Template";
import AppError from "../../errors/AppError";

interface TemplateData {
  name: string;
  mainTemplate: string;
  retryTemplate: string;
  lastTemplate: string;
}

const UpdateTemplateService = async (templateId: string, templateData: TemplateData, companyId: number) => {
  const template = await Template.findOne({
    where: { id: templateId, companyId }
  });

  if (!template) {
    throw new AppError("ERR_TEMPLATE_NOT_FOUND_OR_ACCESS_DENIED", 404);
  }

  template.name = templateData.name;
  template.mainTemplate = templateData.mainTemplate;
  template.retryTemplate = templateData.retryTemplate;
  template.lastTemplate = templateData.lastTemplate;

  await template.save();

  return template; 
};

export default UpdateTemplateService;
