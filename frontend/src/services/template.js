import api from "./api"

export const templateCompanyId = async (companyId) => {
  const response = await api.get(`/template/${companyId}`);
  return response.data;
}