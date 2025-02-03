import AppError from "../../errors/AppError";
import Company from "../../models/Company";
import Template from "../../models/Template"; // Importe o modelo Template

interface Request {
  name: string;
  mainTemplate: string;
  retryTemplate: string;
  lastTemplate: string;
  companyId: number;
}

const CreateTemplateService = async ({
  name,
  mainTemplate,
  retryTemplate,
  lastTemplate,
  companyId,
}: Request): Promise<Template> => {
  if (!name || !mainTemplate || !retryTemplate || !lastTemplate) {
    throw new AppError("ERR_TEMPLATE_REQUIRED_FIELDS", 400);
  }

  if (!companyId || isNaN(Number(companyId))) {
    throw new AppError("ERR_INVALID_COMPANY_ID", 400);
  }

  const companyExists = await Company.findByPk(companyId);
  if (!companyExists) {
    throw new AppError("ERR_COMPANY_NOT_FOUND", 404);
  }

  console.log("Dados para criação do template:", {
    name,
    mainTemplate,
    retryTemplate,
    lastTemplate,
    companyId
  });

  try {
    const template = await Template.create({
      name,
      mainTemplate,
      retryTemplate,
      lastTemplate,
      companyId,
    });
    return template;
  } catch (error) {
    console.error("Erro ao criar template:", error);
    throw new AppError("ERR_TEMPLATE_CREATION_FAILED", 500);
  }
};

export default CreateTemplateService;