import api from "./api";

export const listCompanyId = async (companyId) => {
  const response = await api.get(`/companies/byId/${companyId}`);
  return response.data;
};
