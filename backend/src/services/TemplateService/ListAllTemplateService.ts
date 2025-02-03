import { Op, type FindOptions } from "sequelize";
import Template from "../../models/Template";
import Company from "../../models/Company";

interface Request {
  name?: string;
  mainTemplate: string;
  retryTemplate: string;
  lastTemplate: string;
}

interface Response {
  templates: Template[]; 
}

const ListAllTemplateService = async ({
  name,
}: Request): Promise<Template[]> => { 
  let options: FindOptions = {
    order: [["name", "ASC"]], 
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

export default ListAllTemplateService;
