import { FindOptions, Model } from "sequelize";
import Template from "../../models/Template";
import Company from "../../models/Company";

interface Request {
  templateId: number;  
  companyId: number;   
}

interface Response {
  template: Template | null; 
}

const FindTemplateByIdService = async ({
  templateId,
  companyId,
}: Request): Promise<Response> => {
  const options: FindOptions = {
    where: {
      id: templateId,       
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

  const template = await Template.findOne(options);

  return { template };
};

export default FindTemplateByIdService;
