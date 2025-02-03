import Queue from "../models/Queue";
import Company from "../models/Company";
import User from "../models/User";

interface SerializedUser {
  id: number;
  name: string;
  email: string;
  profile: string;
  cpfUser: string;
  companyId: number;
  company: Company | null;
  super: boolean;
  superbp: boolean;
  queues: Queue[];
  allTicket: string,
}

export const SerializeUser = async (user: User): Promise<SerializedUser> => {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    profile: user.profile,
    cpfUser: user.cpfUser,
    companyId: user.companyId,
    company: user.company,
    super: user.super,
    superbp: user.superbp,
    queues: user.queues,
	allTicket: user.allTicket,
  };
};
