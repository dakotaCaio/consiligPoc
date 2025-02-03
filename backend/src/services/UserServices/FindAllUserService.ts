import User from "../../models/User";
import AppError from "../../errors/AppError";
import Queue from "../../models/Queue";
import { Op, Sequelize } from "sequelize";
import Company from "../../models/Company";

const FindAllUserService = async (name?: string, companyId?: number): Promise<User[]> => {
  const whereConditions: any = {};

  if (name) {
    whereConditions.name = {
      [Op.iLike]: `%${name}%`
    };
  }

  if (companyId) {
    whereConditions.companyId = companyId;
  }

  const users = await User.findAll({
    where: whereConditions,
    include: [
      { model: Queue, as: 'queues' },
      { model: Company, as: 'company', attributes: ["id", "name"] }
    ],
    order: [["id", "ASC"]]
  });

  if (!users || users.length === 0) {
    throw new AppError("ERR_NO_USER_FOUND", 404);
  }

  return users;
};


export default FindAllUserService;
