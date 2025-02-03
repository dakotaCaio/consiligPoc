import api from "./api"

export const listTickets = async () => {
  try {
    const response = await api.get("/tickets");
    return response.data;
  } catch (error) {
    console.error("Error ao buscar tickets:", error);
    throw new Error("Erro interno do servidor");
  }
}