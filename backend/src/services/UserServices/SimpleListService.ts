import User from "../../models/User";
import AppError from "../../errors/AppError";
import Queue from "../../models/Queue";

interface Params {
  companyId: string | number;
}

const SimpleListService = async ({ companyId }: Params): Promise<User[]> => {
  const query: any = {
    attributes: ["name", "id", "email", "companyId", "cpfUser", "profile", "createdAt"],
    include: [
      { model: Queue, as: 'queues' }
    ],
    order: [["id", "ASC"]],
  };

  if (companyId) {
    query.where = {
      companyId
    };
  }

  const users = await User.findAll(query);

  if (!users) {
    throw new AppError("ERR_NO_USER_FOUND", 404);
  }

  return users;
};

export default SimpleListService;
