import { useContext } from "react";
import api from "../../services/api";
import { AuthContext } from "../../context/Auth/AuthContext";

const useQueues = () => {
  const { user } = useContext(AuthContext);

  const findAll = async () => {
    try {
      const endpoint = user?.companyId === 1 ? "/queue" : "/queue/company";
      const response = await api.get(endpoint);
      return response.data;
    } catch (error) {
      console.error("Error fetching queues:", error);
      return null;
    }
  };

  return { findAll };
};

export default useQueues;
