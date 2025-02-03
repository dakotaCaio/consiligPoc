import api from "./api";

export const listWhatsApps = async () => { 
  try {
    const response = await api.get("/whatsapp/list");
    return response.data;
  } catch (error) {
    console.error("Error ao buscar WhatsApps:", error);
    throw new Error("Erro interno do servidor");
  }
};