import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/Auth/AuthContext";
import api from "../../services/api";
import toastError from "../../errors/toastError";

const useContacts = ({ searchParam, pageNumber, date, dateStart, dateEnd }) => {
    const [loading, setLoading] = useState(true);
    const [hasMore, setHasMore] = useState(false);
    const [contacts, setContacts] = useState([]);
    const [count, setCount] = useState(0);
    const { user } = useContext(AuthContext); 

    useEffect(() => {
        setLoading(true);
        const delayDebounceFn = setTimeout(() => {
            const fetchContacts = async () => {
                try {
                    const endpoint = user?.companyId === 1 ? "/contacts/list/" : "/contacts";
                    
                    const { data } = await api.get(endpoint, {
                        params: {
                            searchParam,
                            pageNumber,
                            date,
                            dateStart,
                            dateEnd,
                        },
                    });

                    setContacts(data.contacts);
                    setHasMore(data.hasMore);
                    setCount(data.count);
                    setLoading(false);
                } catch (err) {
                    setLoading(false);
                    toastError(err);
                }
            };

            fetchContacts();
        }, 500); 

        return () => clearTimeout(delayDebounceFn);
    }, [searchParam, pageNumber, date, dateStart, dateEnd, user?.companyId]); 

    return { contacts, loading, hasMore, count };
};

export default useContacts;
