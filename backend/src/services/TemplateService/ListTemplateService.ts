import { Op, type FindOptions } from "sequelize";
import Template from "../../models/Template";
import Company from "../../models/Company";

interface Request {
  name?: string;
  mainTemplate: string;
  retryTemplate: string;
  lastTemplate: string;
  companyId: number;
}

interface Response {
  templates: Template[]; 
}

const ListTemplateService = async ({
  name,
  companyId,
}: Request): Promise<Template[]> => { 
  let options: FindOptions = {
    order: [["name", "ASC"]], 
    where: {
      companyId: companyId, 
    },
    include: [
      {
        model: Company,
        as: "company",
        attributes: ["name"]
      }
    ]
  };

  if (name) {
    options.where = {
      ...options.where,
      name: {
        [Op.iLike]: `%${name}%`, 
      },
    };
  }
  const templates = await Template.findAll(options);

  return templates; 
};

export default ListTemplateService;
