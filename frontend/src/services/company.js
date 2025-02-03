import api from "./api"

export const listCompanies = async () => {
  const response = await api.get("/companies/list");
  return response.data;
}