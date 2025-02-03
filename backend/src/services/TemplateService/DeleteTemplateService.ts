import Template from "../../models/Template";
import AppError from "../../errors/AppError";

const DeleteTemplateService = async (id: string, companyId: number): Promise<Template> => {
  const template = await Template.findOne({
    where: { id, companyId }  
  });

  if (!template) {
    throw new AppError("ERR_NO_TEMPLATE_FOUND_OR_ACCESS_DENIED", 404);  
  }

  await template.destroy();  

  return template; 
};

export default DeleteTemplateService;
