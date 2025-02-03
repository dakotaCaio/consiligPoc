import api from "./api"

export const fetchMessagesData = async (ticketId) => {
    const response = await api.get(`/messages/${ticketId}`);
    return response.data;
}