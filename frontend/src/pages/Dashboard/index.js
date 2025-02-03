import React, { useContext, useState, useEffect } from "react";

import Paper from "@material-ui/core/Paper";
import Papa from 'papaparse';
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import MenuItem from "@material-ui/core/MenuItem";
import TextField from "@material-ui/core/TextField";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import Typography from "@material-ui/core/Typography";
import { Button, Checkbox, InputLabel, ListItemText } from "@material-ui/core";
import { BsBoxArrowInDownRight } from "react-icons/bs";
import { TbClockPause } from "react-icons/tb";
import { TbDeviceMobileCheck } from "react-icons/tb";
import { HiOutlineBuildingStorefront } from "react-icons/hi2";
import { GrChatOption } from "react-icons/gr";
import { LiaUserClockSolid } from "react-icons/lia";
import { BsPeople } from "react-icons/bs";
import { IoCheckmarkDone } from "react-icons/io5";
import { HiOutlineDocumentReport } from "react-icons/hi";
import FilterModal from "../../components/FilterModal";
import { FaSliders } from "react-icons/fa6";
import { useHistory } from "react-router-dom";
import MainContainer from "../../components/MainContainer";
import { shadows } from '@mui/system';
import CircularProgress from "@mui/material/CircularProgress";
import Backdrop from '@material-ui/core/Backdrop';
import { Box } from "@mui/material";
import { jsPDF } from "jspdf";

import { makeStyles } from "@material-ui/core/styles";
import { grey, blue } from "@material-ui/core/colors";
import { toast } from "react-toastify";
import { isArray, size, unset } from "lodash";
import { AuthContext } from "../../context/Auth/AuthContext";
import useDashboard from "../../hooks/useDashboard";
import useContacts from "../../hooks/useContacts";
import { ChatsUser } from "./ChartsUser"
import html2canvas from "html2canvas";
import { isEmpty } from "lodash";
import moment from "moment";
import { ChartsDate } from "./ChartsDate";
import { Dialog, DialogTitle, DialogContent, DialogActions } from "@material-ui/core";
import { listCompanies } from "../../services/company";
import { listTickets } from "../../services/tickets";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import toastError from "../../errors/toastError";
import Promise from "bluebird";
import Bluebird from "bluebird";

const useStyles = makeStyles((theme) => ({
  container: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.padding,
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(2),
  },
  fixedHeightPaper: {
    padding: theme.spacing(2),
    display: "flex",
    flexDirection: "column",
    height: 240,
    overflowY: "auto",
    ...theme.scrollbarStyles,
  },
  cardAvatar: {
    fontSize: "55px",
    color: grey[500],
    backgroundColor: "#ffffff",
    width: theme.spacing(7),
    height: theme.spacing(7),
  },
  cardTitle: {
    fontSize: "18px",
    color: blue[700],
  },
  cardSubtitle: {
    color: grey[600],
    fontSize: "14px",
  },
  alignRight: {
    textAlign: "right",
  },
  fullWidth: {
    width: "100%",
  },
  selectContainer: {
    width: "100%",
    textAlign: "left",
  },
  iframeDashboard: {
    width: "100%",
    height: "calc(100vh - 64px)",
    border: "none",
  },
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  fixedHeightPaper: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
    height: 240,
  },
  customFixedHeightPaper: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
    height: 120,
  },
  customFixedHeightPaperLg: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
    height: "100%",
  },
  card0: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "hidden",
    flexDirection: "column",
    height: "100%",
    borderRadius: "15px",
    background: "linear-gradient(to right, #a70c35, #7f0727)",
    color: "#fff",
    justifyContent: "center"
  },
  card00: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
    height: "60%",
    borderRadius: "15px",
    background: "linear-gradient(to right, #a70c35, #7f0727)",
    color: "#fff",
    justifyContent: "center"
  },
  card1: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
    height: "100%",
    borderRadius: "15px",
    background: "linear-gradient(to right, #a70c35, #7f0727)",
    color: "#fff",
    justifyContent: "center"
  },
  card2: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
    height: "100%",
    borderRadius: "15px",
    background: "linear-gradient(to right, #a70c35, #7f0727)",
    color: "#fff",
    justifyContent: "center"
  },
  card3: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
    height: "100%",
    borderRadius: "15px",
    background: "linear-gradient(to right, #a70c35, #7f0727)",
    color: "#fff",
    justifyContent: "center"
  },
  card4: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
    height: "100%",
    borderRadius: "15px",
    background: "linear-gradient(to right, #a70c35, #7f0727)",
    color: "#fff",
    justifyContent: "center"
  },
  card5: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
    height: "100%",
    borderRadius: "15px",
    background: "linear-gradient(to right, #a70c35, #7f0727)",
    color: "#fff",
    justifyContent: "center"
  },
  card6: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
    height: "100%",
    borderRadius: "15px",
    background: "linear-gradient(to right, #a70c35, #7f0727)",
    color: "#fff",
    justifyContent: "center"
  },
  card7: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
    height: "100%",
    borderRadius: "15px",
    background: "linear-gradient(to right, #a70c35, #7f0727)",
    color: "#fff",
    justifyContent: "center"
  },
  card8: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
    height: "100%",
    borderRadius: "15px",
    background: "linear-gradient(to right, #a70c35, #7f0727)",
    color: "#fff",
    justifyContent: "center"
  },
  card9: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
    height: "100%",
    borderRadius: "15px",
    background: "linear-gradient(to right, #a70c35, #7f0727)",
    color: "#fff",
    justifyContent: "center"
  },
  fixedHeightPaper2: {
    padding: theme.spacing(2),
    marginTop: "15px",
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
  },

  pdfButton: {
    marginBottom: theme.spacing(2),
  },
  popupButton: {
    marginBottom: theme.spacing(2),
    marginLeft: theme.spacing(1),
  },
  filterButtonWrapper: {
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
    gap: "0.4375rem"
  },
  filterButton: {
    color: "black",
    backgroundColor: "transparent",
    border: "none",
    height: "30px",
    fontSize: '20px',
    padding: "0",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
  },
  icon: {
    marginRight: "4px",
    width: "12px"
  },
  textReport: {
    color: "#000",
    fontWeight: "400 !important",
    textTransform: "none",
    letterSpacing: 0,
    textAlign: "center",
    padding: "1rem 0",
    borderBottom: "1px solid #ccc"
  },
  reporterFilter: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "1rem"
  },
  paperReport: {
    backgroundColor: "white",
    width: "537px",
    height: "162px",
    display: "flex",
    borderRadius: "15px",
    flexDirection: "column",
    position: "relative",
  },
  btnCloseReport: {
    width: "120px",
    borderRadius: "18px",
    border: "1px solid"
  },
  btnReport: {
    borderRadius: "18px"
  },
  btnContent: {
    justifyContent: "space-between",
    padding: "1rem"
  },
  dashboardText: {
    fontSize: "12px",
    margin: "0"
  },
  dashboardData: {
    fontSize: "18px",
    margin: "0"
  },
  modalReport: {
    top: "500px !important"
  }
}));

const Dashboard = () => {
  const classes = useStyles();
  const [counters, setCounters] = useState({});
  const [attendants, setAttendants] = useState([]);
  const [period, setPeriod] = useState(0);
  const [filterType, setFilterType] = useState(1);
  const [dateFrom, setDateFrom] = useState(moment("1", "D").format("YYYY-MM-DD"));
  const [dateTo, setDateTo] = useState(moment().format("YYYY-MM-DD"));
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const { find } = useDashboard();
  const [openPopup, setOpenPopup] = useState(false);
  const [openPopupMessages, setOpenPopupMessages] = useState(false);
  const [whatsAppSessions, setWhatsAppSessions] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [status, setStatus] = useState("");
  const [selectedOption, setSelectedOption] = useState('chatsUser');
  const [tickets, setTickets] = useState([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState([]);
  const [inputValue, setInputValue] = useState('');



  const [filteredData, setFilteredData] = useState({
    companies: [],
    whatsAppSessions: [],
    users: [],
    tickets: [],
  });

  const handleApplyFilters = (filteredResults) => {
    setFilteredData(filteredResults);
    setTickets(filteredResults.tickets);
  };



  useEffect(() => {
    setFilteredData({
      companies,
      whatsAppSessions,
      users,
      tickets,
    });
  }, [companies, whatsAppSessions, users, tickets]);


  const handleOpenPopup = () => setOpenPopup(true);
  const handleClosePopup = () => setOpenPopup(false);
  const handleOpenPopupMessages = () => setOpenPopupMessages(true);
  const handleClosePopupMessages = () => setOpenPopupMessages(false);
  const handleStatusChange = (event) => {
    setStatus(event.target.value);
  };

  const handleChange = (event) => {
    setSelectedOption(event.target.value);
  };

  let newDate = new Date();
  let date = newDate.getDate();
  let month = newDate.getMonth() + 1;
  let year = newDate.getFullYear();
  let now = `${year}-${month < 10 ? `0${month}` : `${month}`}-${date < 10 ? `0${date}` : `${date}`}`;

  const [showFilter, setShowFilter] = useState(false);
  const [queueTicket, setQueueTicket] = useState(false);

  const { user } = useContext(AuthContext);
  var userQueueIds = [];

  if (user.queues && user.queues.length > 0) {
    userQueueIds = user.queues.map((q) => q.id);
  }

  useEffect(() => {
    async function firstLoad() {
      await fetchData();
    }
    setTimeout(() => {
      firstLoad();
    }, 1000);
  }, []);

  async function handleChangePeriod(value) {
    setPeriod(value);
  }

  async function handleChangeFilterType(value) {
    setFilterType(value);
    if (value === 1) {
      setPeriod(0);
    } else {
      setDateFrom("");
      setDateTo("");
    }
  }

  const getPendingTickets = () => {
    if (!filteredData || !Array.isArray(filteredData.users)) {
      return 0;
    }
    return filteredData.users.reduce((count, user) => {
      if (Array.isArray(user.tickets)) {
        count += user.tickets.filter(ticket => ticket.status === "pending").length;
      }
      return count;
    }, 0);
  };

  const getOpenTickets = () => {
    if (!filteredData || !Array.isArray(filteredData.users)) {
      return 0;
    }
    return filteredData.users.reduce((count, user) => {
      if (Array.isArray(user.tickets)) {
        count += user.tickets.filter(ticket => ticket.status === "open").length;
      }
      return count;
    }, 0);
  };

  const getFinishedTickets = () => {
    if (!filteredData || !Array.isArray(filteredData.users)) {
      return 0;
    }
    return filteredData.users.reduce((count, user) => {
      if (Array.isArray(user.tickets)) {
        count += user.tickets.filter(ticket => ticket.status === "closed").length;
      }
      return count;
    }, 0);
  };
 // Flag para verificar se o componente está montado
  
    const fetchCompanies = async () => {
      try {
        const endpoint = user?.companyId === 1 ? "/companies/list" : "/companies";
        const companiesResponse = await listCompanies(endpoint);
  
        if (Array.isArray(companiesResponse)) {
          setCompanies(companiesResponse);
  
          const allWhatsAppSessions = companiesResponse.flatMap(company => company.whatsapps || []);
          setWhatsAppSessions(allWhatsAppSessions);
  
          const allUsers = companiesResponse.flatMap(company => company.users || []);
          setUsers(allUsers);
  
          const allTickets = companiesResponse.flatMap(company =>
            company.users.flatMap(user => user.tickets || [])
          );
          setTickets(allTickets);
        } else {
          console.error("A resposta da API não é um array:", companiesResponse);
        }
      } catch (err) {
        setLoading(false);
        toastError(err);
      }
    };

    useEffect(() => {
      if (user) {
        fetchCompanies(); 
      }
    }, [user]); 

    const listCompanies = async (endpoint) => {
      try {
        const response = await api.get(endpoint);
        return response.data; 
      } catch (error) {
        console.error("Erro ao carregar empresas:", error);
        return [];
      }
    };


  const fetchTickets = async () => {
    const tickets = await listTickets();
    setTickets(tickets);
  }

  async function fetchData() {
    setLoading(true);

    let params = {};

    if (period > 0) {
      params = {
        days: period,
      };
    }

    if (!isEmpty(dateFrom) && moment(dateFrom).isValid()) {
      params = {
        ...params,
        date_from: moment(dateFrom).format("YYYY-MM-DD"),
      };
    }

    if (!isEmpty(dateTo) && moment(dateTo).isValid()) {
      params = {
        ...params,
        date_to: moment(dateTo).format("YYYY-MM-DD"),
      };
    }

    if (Object.keys(params).length === 0) {
      toast.error("Parametrize o filtro");
      setLoading(false);
      return;
    }

    const data = await find(params);

    setCounters(data.counters);
    if (isArray(data.attendants)) {
      setAttendants(data.attendants);
    } else {
      setAttendants([]);
    }

    setLoading(false);
  }

  function formatTime(minutes) {
    return moment()
      .startOf("day")
      .add(minutes, "minutes")
      .format("HH[h] mm[m]");
  }


  const fetchTicketsData = async () => {
    const token = localStorage.getItem("token");
  
    try {
      let url = "/tickets/list";
  
      if (status) {
        url += `?status=${status}`;
      }
  
      const response = await api.get(url, {
        params: { isReport: true },
        headers: {
          "Authorization": `Bearer ${JSON.parse(token)}`,
          "Content-Type": "application/json",
        },
      });
  
      if (response.status !== 200 || !Array.isArray(response.data.tickets)) {
        throw new Error("Erro ao buscar dados dos tickets");
      }
  
      return response.data.tickets || [];
    } catch (error) {
      console.error("Erro ao buscar tickets:", error);
      return [];
    }
  };
  

  const fetchContactData = async () => {
    const token = localStorage.getItem("token");
    try {
      const url = user.companyId === 1 ? "/contacts/list" : "/contacts";

      const response = await api.get(url, {
        params: { isReport: true },
        headers: {
          "Authorization": `Bearer ${JSON.parse(token)}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status !== 200) {
        throw new Error("Erro ao buscar dados de contatos");
      }
      const data = response.data;

      if (Array.isArray(data)) {
        return data;
      } else if (data && Array.isArray(data.contacts)) {
        return data.contacts;
      } else {
        return [];
      }
    } catch (error) {
      return [];
    }
  };

  const fetchUserData = async () => {
    const token = localStorage.getItem("token");
    try {
      const url = "/users/list";
      const response = await api.get(url, {
        headers: {
          "Authorization": `Bearer ${JSON.parse(token)}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status !== 200) {
        throw new Error("Erro ao buscar dados de usuários");
      }

      const data = response.data;

      if (Array.isArray(data)) {
        return data;
      } else {
        return [];
      }
    } catch (error) {
      return [];
    }
  };

  const fetchMessagesData = async (ticketId) => {
    if (!ticketId) {
      console.error("Erro: ticketId não fornecido");
      return [];
    }
  
    const token = localStorage.getItem("token");
  
    try {
      const url = user.companyId === 1 ? `/messages/all/${ticketId}` : `/messages/${ticketId}`;
      const response = await api.get(url, {
        headers: {
          "Authorization": `Bearer ${JSON.parse(token)}`,
          "Content-Type": "application/json",
        },
      });
  
      if (response.status !== 200) {
        throw new Error("Erro ao buscar dados de mensagens");
      }
  
      const data = response.data;

      return data;
    } catch (error) {
      console.error("Erro ao buscar mensagens:", error);
      return [];
    }
  };

  const fetchQueueTicketsData = async (queueId) => {
    try {
      const params = {};

      if (status) params.status = status;
      if (dateFrom && moment(dateFrom).isValid()) {
        params.date_from = moment(dateFrom).format("YYYY-MM-DD");
      }
      if (dateTo && moment(dateTo).isValid()) {
        params.date_to = moment(dateTo).format("YYYY-MM-DD");
      }

      const { data } = await api.get(`/queue/${queueId}/tickets`, { params });

      if (data && Array.isArray(data)) {
        return data;
      } else {
        return [];
      }
    } catch (error) {
      return [];
    }
  };

  const GetUsers = () => {
    let count;
    let userOnline = 0;
    attendants.forEach(user => {
      if (user.online === true) {
        userOnline = userOnline + 1
      }
    })
    count = userOnline === 0 ? 0 : userOnline;
    return count;
  };

  const GetContacts = (all) => {
    let props = {};
    if (all) {
      props = {};
    }
    const { count } = useContacts(props);
    return count;
  };

  const formatToBrazilTime = (dateString) => {
		const date = new Date(dateString); 
		date.setHours(date.getHours()); 

		const formattedDate = date.toLocaleString("pt-BR", {
		  timeZone: "America/Sao_Paulo",
		  year: "numeric",
		  month: "2-digit",
		  day: "2-digit",
		  hour: "2-digit",
		  minute: "2-digit",
		  second: "2-digit",
		});
	  
		return formattedDate;
	  };

  const downloadCSV = async () => {
    setLoading(true);
  
    try {
      const endpoint = user?.companyId === 1 ? "/companies/list" : "/companies";
      const companiesResponse = await listCompanies(endpoint);
      setCompanies(companiesResponse);
      const ticketData = await fetchTicketsData();
      const contactData = await fetchContactData();
      const userData = await fetchUserData();
      const messagesData = await fetchMessagesData();
  
      let queueTicketData = [];
      const allTicketIds = new Set();
  
      for (const queueId of userQueueIds) {
        const ticketsInQueue = await fetchQueueTicketsData(queueId);
        ticketsInQueue.forEach(ticket => {
          if (!allTicketIds.has(ticket.id)) {
            queueTicketData.push(ticket);
            allTicketIds.add(ticket.id);
          }
        });
      }
  
      const combinedTicketData = [...ticketData, ...queueTicketData];
  
      const filteredTickets = combinedTicketData.filter(ticket => {
        if (selectedCompanyId.length === 0) {
          return true;
        }
        return selectedCompanyId.includes(ticket.companyId);
      });
  
      const isDateValid = (date) => moment(date, "YYYY-MM-DD", true).isValid();
      const filterStartDate = isDateValid(dateFrom) ? moment(dateFrom, "YYYY-MM-DD") : null;
      const filterEndDate = isDateValid(dateTo) ? moment(dateTo, "YYYY-MM-DD") : null;
  
      const filteredTicketData = filteredTickets.filter(ticket => {
        const createdDate = moment(ticket.createdAt, "YYYY-MM-DD");
  
        const isAfterStartDate = filterStartDate ? createdDate.isSameOrAfter(filterStartDate) : true;
        const isBeforeEndDate = filterEndDate ? createdDate.isSameOrBefore(filterEndDate) : true;
  
        return isAfterStartDate && isBeforeEndDate;
      });
  
      if (!filteredTicketData || filteredTicketData.length === 0) {
        alert("Nenhum dado de ticket encontrado no intervalo de datas selecionado.");
        return;
      }
  
      const adjustDate = (dateString) => {
        const date = new Date(dateString);
        date.setHours(date.getHours());
        return date.toLocaleString("pt-BR").replace(", ", " ");
      };
  
      const contactMap = contactData.reduce((map, contact) => {
        if (contact && contact.id) {
          map[contact.id] = contact;
        }
        return map;
      }, {});
  
      const companyMap = companies.reduce((map, company) => {
        if (company && company.id) {
          map[company.id] = company.name;
        }
        return map;
      }, {});
  
      const csvData = await Bluebird.map(filteredTicketData, async (ticket) => {
        if (ticket.tags && Array.isArray(ticket.tags) && ticket.tags.some(tag => tag.id === 250)) {
          return null; // Ignora se tiver tag 250
        }
  
        const contact = contactMap[ticket.contactId];
        const tagString = (ticket.tags && Array.isArray(ticket.tags)) ? ticket.tags.map(tag => tag.name).join(", ") : "Sem tags";
        const user = userData.find(u => u.id === ticket.userId);
        const companyName = companyMap[ticket.companyId] || "Empresa não encontrada";
  
        const enviado = "1";
        const confirmado = "1";
        const falha = "0";
  
        const interaction = ticket.fromMe ? "Operator" : "Client";
        const ticketId = ticket.id;
        const messages = await fetchMessagesData(ticketId);
        let readMessages = [];
  
        if (messages && Array.isArray(messages.messages)) {
          readMessages = messages.messages;
          console.log("ticketMessages", readMessages);
  
          let readIndex = "Sem mensagens";
          if (readMessages.length > 0) {
            const lastMessage = readMessages[readMessages.length - 1];
            readIndex = lastMessage.read ? "Visualizada" : "Não visualizada";
          }
        } else {
          console.log("Erro: 'messages' ou 'messages.messages' não estão disponíveis.");
          readMessages = [];
        }
  
        let readIndex = "Sem mensagens";
        if (readMessages.length > 0) {
          const lastMessage = readMessages[readMessages.length - 1];
          readIndex = lastMessage.read ? "Visualizada" : "Não visualizada";
        }
  
        return [
          ticket.id || "",
          companyName,
          contact ? contact.name : "",
          contact ? contact.number : "",
          contact ? contact.cnpj_cpf : "CPF não encontrado",
          contact ? contact.contract : "Contrato não encontrado",
          user ? user.name : "",
          user ? user.cpfUser : "",
          tagString,
          ticket.status || "",
          adjustDate(ticket.createdAt) || "",
          adjustDate(ticket.updatedAt) || "",
          enviado,
          confirmado,
          falha,
          interaction,
          readIndex
        ];
      }, { concurrency: 100 }); 
  
      const validCsvData = csvData.filter(data => data !== null);
  
      // Gerando o CSV
      const headers = [
        "Id", "Carteira", "Nome do Cliente", "Telefone", "CNPJ/CPF", "Contrato", "Nome do Operador", "CPF Operador", "Tabulação", "status",  "Primeiro atendimento", "Último Atendimento", "Enviado", "Confirmado", "Falha", "Leitura", "Interação"
      ];
  
      const csvContent = [headers, ...validCsvData];
  
      // Gerando o CSV
      const csv = Papa.unparse(csvContent, {
        quotes: true,
        delimiter: ",",
      });
  
      const csvBlob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  
      const link = document.createElement("a");
      link.href = URL.createObjectURL(csvBlob);
      link.download = `Relatório.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  
    } catch (error) {
      console.error("Erro ao gerar CSV:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async (number) => {
		try {
			console.log("Iniciando download do PDF...");
			const response = await api.get(`/pdf/${number}`);
			console.log("Resposta completa:", response);
			console.log("Dados recebidos:", response.data);
	
			const messages = response.data.messages;
      const users = response.data.responseUsers;
   
      
      if(!users[0]){
        toastError("Não existe um ticket aberto ou fechado para este Número!");
        return;
      }
	
			if (!Array.isArray(messages)) {
				toastError("Os dados de mensagens não estão no formato esperado.");
				return;
			}
	
			if (messages.length === 0) {
				toastError("Nenhuma mensagem encontrada para este número.");
				return;
			}
	
			const doc = new jsPDF();
			doc.setFontSize(12);
			doc.text(`Histórico de Mensagens - Número: ${number} | Atendente: ${users[0].name}`, 10, 10);
			doc.line(10, 15, 200, 15);
	
			let yPosition = 20;
			const lineHeight = 10;
			const pageHeight = 280;
	
			messages.forEach((message, index) => {
				const author = message.contact?.name || users[0].name; 
				const content = message.body || "Sem conteúdo"; 
				const formattedDate = formatToBrazilTime(message.createdAt); 
			  
				const messageText = `${index + 1}. ${author}: ${content} - ${formattedDate}`;
				console.log(`Processando mensagem ${index + 1}:`, messageText);
			  
				const splitText = doc.splitTextToSize(messageText, 180);
			  
				splitText.forEach(line => {
				  if (yPosition + lineHeight > pageHeight) {
					doc.addPage();
					yPosition = 10;
				  }
				  doc.text(line, 10, yPosition);
				  yPosition += lineHeight;
				});
			});

			doc.save(`Histórico de Mensagens do Número:${number}.pdf`);
		} catch (err) {
			console.error("Erro ao gerar o PDF:", err);
			toastError("Erro ao gerar o PDF. Tente novamente.");
		}
	};

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleGenerateReport = async () => {
    setLoading(true);
    try {
      if (selectedCompanyId) {
        const selectedCompany = companies.find(company => company.id === selectedCompanyId);
        if (selectedCompany) {
          console.log("Empresa selecionada", selectedCompany);
        }
      }

      await downloadCSV();
    } catch (error) {
      console.error("Erro ao gerar relatório:", error);
    } finally {
      setLoading(false);
    }
  };
  const history = useHistory();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);
  const handleApply = (newFilteredData) => {
    setFilteredData(newFilteredData);
    handleCloseModal();
  };

  const handleCompanyChange = (e) => {
    const selectedCompanies = e.target.value;
    setSelectedCompanyId(selectedCompanies === "" ? null : selectedCompanies);
  };

  const selectedCompany = companies.find(company => company.id === selectedCompanyId);
  return (
    <div>
      <Container maxWidth="lg" className={classes.container}>
      <div id="filterreport">
      <MainContainer classes={classes.mainContainer}>
        {user?.companyId === 1 && (
          <div className={classes.reporterFilter}>
            <div className={classes.filterButtonWrapper} onClick={handleOpenModal}>
              <FaSliders className={classes.icon} size={25} />
              <button className={classes.filterButton}>
                Filtro
              </button>
            </div>
            <FilterModal
              open={isModalOpen}
              onClose={handleCloseModal}
              onApply={handleApply}
              setFilteredData={setFilteredData}
            />
            <Button
              onClick={handleOpenPopup}
              className={classes.filterButtonWrapper}
            >
              <HiOutlineDocumentReport size={12} />
              <button className={classes.filterButton} style={{ marginLeft: "7px" }}>
                Relatório CSV
              </button>
            </Button>
          </div>
        )}
      </MainContainer>
    </div>

        <Dialog open={openPopup} onClose={handleClosePopup}>
          <Backdrop open={loading} style={{ zIndex: 2000 }}>
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              p={4}
              bgcolor="#fff"
              borderRadius={4}
              boxShadow={3}
            >
              <CircularProgress size={60} />
              <Typography variant="h6" style={{ marginTop: 16 }}>
                Gerando relatório...
              </Typography>
            </Box>
          </Backdrop>
          <DialogTitle>Filtro de Data e Status</DialogTitle>
          <DialogContent style={{ maxHeight: '400px', overflowY: 'auto' }}>
            <form>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    label="De"
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    fullWidth
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Até"
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    fullWidth
                    margin="normal"
                  />
                </Grid>
              </Grid>

              <div>
                {user.companyId === 1 && (
                  <FormControl margin="dense" variant="outlined" fullWidth style={{ top: "500px !important" }} >
                    <InputLabel>{i18n.t("Selecionar uma carteira")}</InputLabel>
                    <Select style={{ top: "500px !important" }}
                      labelId="dialog-select-company-label"
                      id="dialog-select-company"
                      name="companyId"
                      multiple
                      value={selectedCompanyId}
                      onChange={handleCompanyChange}
                      label={i18n.t("Selecionar uma carteira")}
                      fullWidth
                      renderValue={(selected) => {
                        if (selected.length === 0) {
                          return i18n.t("Selecionar uma carteira");
                        }
                        return selected
                          .map((id) => companies.find((company) => company.id === id)?.name)
                          .join(", ");
                      }}
                      PopperProps={{
                        disablePortal: true,
                        modifiers: [
                          {
                            name: "offset",
                            options: {
                              offset: [0, 10],
                            },
                          },
                        ],
                      }}
                    >
                      {companies.map((company) => (
                        <MenuItem key={company.id} value={company.id} style={{ top: "500px !important" }} >
                          <Checkbox checked={selectedCompanyId.indexOf(company.id) > -1} />
                          <ListItemText primary={company.name} style={{ top: "500px !important" }} />
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              </div>
            </form>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClosePopup} color="primary">
              Fechar
            </Button>
            <Button onClick={handleGenerateReport} color="primary" variant="contained" disabled={loading}>
              Gerar relatório
            </Button>
          </DialogActions>
        </Dialog>


        <div id="dashboard-content">
          <Grid container spacing={3} justifyContent="flex-end">

          {(user.super || user.superbp || user.companyId !== 1) && (
  <Grid item xs={0} sm={6} md={4} className="conexoes" style={{ padding: "0" }}>
    <Paper className={classes.card0} elevation={4} style={{ overflow: "hidden" }}>
      <Grid container spacing={3}>
        <Grid item xs={8}>
          <Typography
            variant="h6"
            component="h3"
            paragraph
            className={classes.dashboardText}
          >
            Conexões Ativas
          </Typography>

          <Grid item>
            <Typography variant="h4" component="h1" className={classes.dashboardData}>
              {
                // Filter the WhatsApp sessions to show only those with "CONNECTED" status
                filteredData.whatsAppSessions.filter(session => session.status === "CONNECTED").length
              }
            </Typography>
          </Grid>
        </Grid>

        <Grid item xs={2}>
          <TbDeviceMobileCheck style={{ fontSize: 60, color: "#fff" }} />
        </Grid>
      </Grid>
    </Paper>
  </Grid>
)}

            {(user.super || user.superbp) && (
              <Grid item Z sm={6} md={4} className="empresas" style={{ padding: "0" }}>
                <Paper className={classes.card00} elevation={4} style={{ overflow: "hidden" }}>
                  <Grid container spacing={3}>
                    <Grid item xs={8}>

                      <Typography
                        variant="h6"
                        component="h3"
                        paragraph
                        className={classes.dashboardText}>
                        CARTEIRAS
                      </Typography>
                      <Grid item>
                        <Typography variant="h4" component="h1" className={classes.dashboardData}>
                          {filteredData.companies.length}
                        </Typography>
                      </Grid>
                    </Grid>
                    <Grid item xs={2}>
                      <HiOutlineBuildingStorefront style={{ fontSize: 60, color: "#fff" }} />
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            )}

            <Grid item xs={0} sm={6} md={4} className="emconversa" style={{ padding: "0" }}>
              <Paper className={classes.card1} elevation={4} style={{ overflow: "hidden" }}>
                <Grid container spacing={3}>
                  <Grid item xs={8}>
                    <Typography
                      variant="h6"
                      component="h3"
                      paragraph
                      style={{ fontWeight: "600" }}
                      className={classes.dashboardText}>
                      Em conversa
                    </Typography>
                    <Grid item>
                      <Typography
                        variant="h4"
                        component="h1"
                        style={{ fontWeight: "bold" }}
                        className={classes.dashboardData}>
                        {getOpenTickets()}
                      </Typography>
                    </Grid>
                  </Grid>
                  <Grid item xs={2}>
                    <GrChatOption style={{ fontSize: 60, color: "#fff" }} />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            <Grid item xs={0} sm={6} md={4} className="standby" style={{ padding: "0" }}>
              <Paper className={classes.card2} elevation={4} style={{ overflow: "hidden" }}>
                <Grid container spacing={3}>
                  <Grid item xs={8}>
                    <Typography
                      component="h3"
                      variant="h6"
                      paragraph
                      style={{ fontWeight: "600" }}
                      className={classes.dashboardText}
                    >
                      STAND BY
                    </Typography>
                    <Grid item>
                      <Typography
                        component="h1"
                        variant="h4"
                        style={{ fontWeight: "bold" }}
                        className={classes.dashboardData}
                      >
                        {getPendingTickets()}
                      </Typography>
                    </Grid>
                  </Grid>
                  <Grid item xs={4}>
                    <LiaUserClockSolid style={{ fontSize: 60, color: "#fff" }} />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            <Grid item xs={0} sm={6} md={4} className="opativos" style={{ padding: "0" }}>
              <Paper className={classes.card6} elevation={4}>
                <Grid container spacing={3}>
                  <Grid item xs={8}>
                    <Typography
                      component="h3"
                      variant="h6"
                      paragraph
                      style={{ fontWeight: "600" }}
                      className={classes.dashboardText}>
                      OPERADORES ATIVOS
                    </Typography>
                    <Grid item>
                      <Typography
                        component="h1"
                        variant="h4"
                        style={{ fontWeight: "bold" }}
                        className={classes.dashboardData}>

                        <span style={{ color: "#fff" }} className={classes.dashboardData}>
                          {filteredData.users.length}/
                        </span>
                        {GetUsers()}
                      </Typography>
                    </Grid>
                  </Grid>
                  <Grid item xs={4}>
                    <BsPeople style={{ fontSize: 60, color: "#fff" }} />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            <Grid item xs={0} sm={6} md={4} className="finalizados" style={{ padding: "0" }}>
              <Paper className={classes.card3} elevation={4} style={{ overflow: "hidden" }}>
                <Grid container spacing={3}>
                  <Grid item xs={8}>
                    <Typography
                      component="h3"
                      variant="h6"
                      paragraph
                      style={{ fontWeight: "600" }}
                      className={classes.dashboardText}>
                      FINALIZADOS
                    </Typography>
                    <Grid item>
                      <Typography
                        component="h1"
                        variant="h4"
                        style={{ fontWeight: "bold" }}
                        className={classes.dashboardData}>
                        {getFinishedTickets()}
                      </Typography>
                    </Grid>
                  </Grid>
                  <Grid item xs={4}>
                    <IoCheckmarkDone style={{ fontSize: 60, color: "#fff" }} />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
            <Grid item xs={0} sm={6} md={4} className="novoscontatos" style={{ padding: "0" }}>
              <Paper className={classes.card4} style={{ overflow: "hidden" }} elevation={6}>
                <Grid container spacing={3}>
                  <Grid item xs={8}>
                    <Typography
                      component="h3"
                      variant="h6"
                      paragraph
                      style={{ fontWeight: "600" }}
                      className={classes.dashboardText}>
                      CONTATOS TOTAIS
                    </Typography>
                    <Grid item>
                      <Typography
                        component="h1"
                        variant="h4"
                        style={{ fontWeight: "bold" }}
                        className={classes.dashboardData}>
                        {GetContacts(true)}
                      </Typography>
                    </Grid>
                  </Grid>
                  <Grid item xs={4}>
                    <BsBoxArrowInDownRight style={{ fontSize: 60, color: "#fff" }} />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            <Grid item xs={0} sm={6} md={4} className="tmespera" style={{ padding: "0" }}>
              <Paper className={classes.card9} elevation={4} style={{ overflow: "hidden" }}>
                <Grid container spacing={3}>
                  <Grid item xs={8}>
                    <Typography
                      variant="h6"
                      component="h3"
                      paragraph
                      className={classes.dashboardText}>
                      T.M. de Espera
                    </Typography>
                    <Grid item>
                      <Typography
                        variant="h4"
                        component="h1"
                        className={classes.dashboardData}>
                        {formatTime(counters.avgWaitTime)}
                      </Typography>
                    </Grid>
                  </Grid>
                  <Grid item xs={4}>
                    <TbClockPause style={{ fontSize: 60, color: "#fff" }} />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
          <div style={{ padding: "1rem 0" }}>
            {/*  <Grid item xs={0}>
            {attendants.length ? (
              <TableAttendantsStatus attendants={attendants}
              loading={loading}
              />
            ) : null}
          </Grid>
       */}
            <Grid container spacing={2} style={{ marginTop: 20 }} className="grafics">
              <FormControl fullWidth>
                <Select
                  value={selectedOption}
                  onChange={handleChange}
                  label="Escolha um Gráfico"
                >
                  <MenuItem value="chatsUser">Total de Conversas por Operador</MenuItem>
                  <MenuItem value="chartsUser">Total de Converas por Carteira</MenuItem>
                </Select>
              </FormControl>
              {selectedOption === 'chatsUser' && (
                <Grid item xs={12}>
                  <ChatsUser />
                </Grid>
              )}
              {selectedOption === 'chartsUser' && (
                <Grid item xs={12}>
                  <ChartsDate />
                </Grid>
              )}
            </Grid>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default Dashboard;