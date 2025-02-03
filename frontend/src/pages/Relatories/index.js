import React, { useState, useEffect, useContext } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import { i18n } from "../../translate/i18n";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import { AuthContext } from "../../context/Auth/AuthContext";
import api from "../../services/api";
import { Backdrop, Box, Checkbox, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, Grid, InputLabel, ListItemText, MenuItem, Paper, Select, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@material-ui/core";
import Papa from "papaparse";
import moment from "moment";
import { listCompanies } from "../../services/company";
import toastError from "../../errors/toastError";
import Bluebird from "bluebird";
import { listTickets } from "../../services/tickets";
import { toast } from "react-toastify";
import useDashboard from "../../hooks/useDashboard";
import { isArray, isEmpty } from "lodash";
import HistoryModal from "../../components/HistoryModal";
import jsPDF from "jspdf";
import { BsDownload } from "react-icons/bs";

const useStyles = makeStyles((theme) => ({
  mainContainer: {
    display: "flex",
    flexDirection: "column", 
    justifyContent: "flex-start",
    alignItems: "center",
    padding: theme.spacing(3),
    backgroundColor: "#f9f9f9",
  },
  section: {
    marginBottom: theme.spacing(4),
    width: "100%",
    padding: theme.spacing(2), 
    backgroundColor: "#fff",  
    borderRadius: "10px",  
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)", 
  },
  sectionHeader: {
    marginBottom: theme.spacing(1.5),
    fontWeight: 600,
    fontSize: "1.5rem",
    color: theme.palette.primary.main,
  },
  tableContainer: {
    maxHeight: 500, 
    overflowY: "auto",
    borderRadius: "10px", 
    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",  
  },
  table: {
    minWidth: 650,
    borderCollapse: "separate",
    borderSpacing: "0 8px", 
  },
  tableHead: {
    backgroundColor: theme.palette.primary.main,
    color: "#fff", 
    fontSize: "1rem",
    fontWeight: 600,
    borderRadius: "8px 8px 0 0", 
  },
  tableCell: {
    padding: theme.spacing(1.5),
    fontSize: "1rem",
    textAlign: "center",  
  },
	tableButtonn: {
		display: "flex",
    justifyContent: "center"
	},
  exportButton: {
    padding: theme.spacing(0.75, 2),
    textTransform: "none",
    fontSize: "0.875rem",
    backgroundColor: theme.palette.secondary.main,
    color: "#fff",
    borderRadius: "20px",
    display: "flex",
    alignItems: "center", 
  },
  exportIcon: {
    marginRight: theme.spacing(0.5), 
  },
  card: {
    width: "100%",
    maxWidth: 450,
    margin: "auto",
    padding: theme.spacing(3),
    borderRadius: 12,
    backgroundColor: "#fff",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
    textAlign: "center",
    marginBottom: theme.spacing(3),
  },
  description: {
    fontSize: "14px",
    marginBottom: "4px",
    marginTop: "4px",
  }
}));

const Relatories = () => {
  const classes = useStyles();
  const [openPopup, setOpenPopup] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [dateFrom, setDateFrom] = useState(moment("1", "D").format("YYYY-MM-DD"));
  const [dateTo, setDateTo] = useState(moment().format("YYYY-MM-DD"));
  const [selectedCompanyId, setSelectedCompanyId] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const { user } = useContext(AuthContext);
	const [openHistoryModal, setOpenHistoryModal] = useState(false);
	const [searchParam, setSearchParam] = useState("");
	const [openPopupMessages, setOpenPopupMessages] = useState(false);
	const [counters, setCounters] = useState({});
	const [attendants, setAttendants] = useState([]);
	const [period, setPeriod] = useState(0);
	const [filterType, setFilterType] = useState(1);
	const [users, setUsers] = useState([]);
	const { find } = useDashboard();
  const [loading, setLoading] = useState(false);
	const [whatsAppSessions, setWhatsAppSessions] = useState([]);
	const [status, setStatus] = useState("");
	const [selectedOption, setSelectedOption] = useState('chatsUser');
	const [tickets, setTickets] = useState([]);
	const [inputValue, setInputValue] = useState('');
  const [openTemplateModal, setOpenTemplateModal] = useState(false);
const [openCSVModal, setOpenCSVModal] = useState(false);
const [openShootingModal, setOpenShootingModal] = useState(false);
const [reports, setReports] = useState([]);


  const [reportData, setReportData] = useState({
    templates: [
      { name: "Template 1", date: "2025-01-01", status: "Gerado" },
      { name: "Template 2", date: "2025-01-02", status: "Em progresso" },
      { name: "Template 3", date: "2025-01-03", status: "Pendente" }
    ],
    csv: [
      { name: "CSV 1", date: "2025-01-01", status: "Gerado" },
      { name: "CSV 2", date: "2025-01-02", status: "Em progresso" },
      { name: "CSV 3", date: "2025-01-03", status: "Pendente" }
    ],
    shooting: [
      { name: "Shooting 1", date: "2025-01-01", status: "Gerado" },
      { name: "Shooting 2", date: "2025-01-02", status: "Em progresso" },
      { name: "Shooting 3", date: "2025-01-03", status: "Pendente" }
    ],
    history: [
      { name: "History 1", date: "2025-01-01", status: "Gerado" },
      { name: "History 2", date: "2025-01-02", status: "Em progresso" },
      { name: "History 3", date: "2025-01-03", status: "Pendente" }
    ],
  });

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
		const handleDownloadReport = async (reportId) => {
			try {
				setLoading(true);
		
				if (!user?.companyId || !reportId) {
					console.error("companyId ou reportId não estão definidos.");
					return;
				}
		
				const endpoint = `/template/${user?.companyId}/download-templateHistory/${reportId}`;
				console.log(`Url da requisição: ${endpoint}`)
				const reportsResponse = await api.get(endpoint);
		
				if (reportsResponse.data && reportsResponse.data.csvContent) {
					const csvContent = reportsResponse.data.csvContent;
		
					const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
					const link = document.createElement("a");
					link.href = URL.createObjectURL(blob);
					link.download = "Template.csv";
					link.click();
				} else {
					console.error("Arquivo não encontrado no histórico.");
				}
			} catch (error) {
				console.error("Erro ao tentar baixar o relatório:", error);
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

	useEffect(() => {
		setFilteredData({
			companies,
			tickets,
		});
	}, [companies, tickets]);

  const handleGenerateHistoryCSV = async () => {
    setLoading(true);
    try {
      if (selectedCompanyId && selectedCompanyId.length > 0) {
        console.log("Empresas selecionadas:", selectedCompanyId);
      } else {
        console.log("Nenhuma empresa selecionada.");
      }

      const params = {};
  
      if (dateFrom && moment(dateFrom).isValid()) {
        params.date_from = moment(dateFrom).format("YYYY-MM-DD");
        console.log("Filtro de Data De:", dateFrom);
      }
      if (dateTo && moment(dateTo).isValid()) {
        params.date_to = moment(dateTo).format("YYYY-MM-DD");
        console.log("Filtro de Data Até:", dateTo);
      }

      if (selectedCompanyId && selectedCompanyId.length > 0) {
        params.company_ids = selectedCompanyId; 
        console.log("Empresas selecionadas:", selectedCompanyId);
      }

      const response = await api.get("/tickets/list", {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        params,
      });
  
      if (response.status !== 200 || !Array.isArray(response.data.tickets)) {
        console.error("Erro ao buscar os tickets:", response);
        throw new Error("Erro ao buscar os tickets");
      }
  
      let tickets = response.data.tickets;
      console.log("Tickets recebidos:", tickets);
  
      if (selectedCompanyId && selectedCompanyId.length > 0) {
        tickets = tickets.filter(ticket => selectedCompanyId.includes(ticket.companyId));
      }
  
      tickets = tickets.filter(ticket => {
        const createdDate = moment(ticket.createdAt, "YYYY-MM-DD");
        const isAfterStartDate = moment(dateFrom).isValid() ? createdDate.isSameOrAfter(moment(dateFrom)) : true;
        const isBeforeEndDate = moment(dateTo).isValid() ? createdDate.isSameOrBefore(moment(dateTo)) : true;
        return isAfterStartDate && isBeforeEndDate;
      });

      const ticketGroups = {};
      tickets.forEach(ticket => {
        const companyName = ticket.company?.name || "Empresa não encontrada";
        const cpnTicketsValue = ticket.cpnTickets ? "true" : "false";
        const cpnTicketsDate = ticket.cpnTickets && ticket.cpnTickets.date
          ? moment(ticket.cpnTickets.date).format("YYYY-MM-DD")
          : "";
  
        if (cpnTicketsValue === "true" && cpnTicketsDate) {
          if (!ticketGroups[companyName]) {
            ticketGroups[companyName] = {};
          }
          if (!ticketGroups[companyName][cpnTicketsDate]) {
            ticketGroups[companyName][cpnTicketsDate] = 0;
          }
          ticketGroups[companyName][cpnTicketsDate]++;
        }
      });

      const csvData = [];
      for (const companyName in ticketGroups) {
        for (const date in ticketGroups[companyName]) {
          const count = ticketGroups[companyName][date];
          csvData.push([companyName, count, date]);
        }
      }
  
      console.log("Dados para CSV:", csvData);
  
      const headers = ["Empresa", "Envio", "Data do Envio"];
      const csvContent = [headers, ...csvData].map(e => e.join(";")).join("\n");
  
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
  
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "tickets.csv";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  
    } catch (error) {
      console.error("Erro ao gerar CSV:", error);
    } finally {
      setLoading(false);
    }
  };

	const handleOpenHistoryModal = () => {
		setOpenHistoryModal(true);
	};

	const handleCloseHistoryModal = () => {
		setOpenHistoryModal(false);
	};

	const handleCompanyChange = (e) => {
		const selectedCompanies = e.target.value;
		setSelectedCompanyId(selectedCompanies === "" ? null : selectedCompanies);
	};

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

  const fetchTemplateHistory = async () => {
    try {
      const endpoint = `/template/${user?.companyId}/download-templateHistory`;
      const reportsResponse = await api.get(endpoint);

      if (Array.isArray(reportsResponse.data)) {
        setReports(reportsResponse.data);
      } else {
        console.error("A resposta da API não é um array:", reportsResponse.data);
      }
    } catch (err) {
      setLoading(false);
      toastError(err);
    }
  };
	
	useEffect(() => {
		fetchTemplateHistory();
	}, []);

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
					return null; 
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
	
			const headers = [
				"Id", "Carteira", "Nome do Cliente", "Telefone", "CNPJ/CPF", "Contrato", "Nome do Operador", "CPF Operador", "Tabulação", "status", "Primeiro atendimento", "Último Atendimento", "Enviado", "Confirmado", "Falha", "Leitura", "Interação"
			];
	
			const csvContent = [headers, ...validCsvData];
	
			const csv = Papa.unparse(csvContent, {
				quotes: true,
				delimiter: ",",
			});

			const csvBlob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
			const link = document.createElement("a");
			link.href = URL.createObjectURL(csvBlob);
			link.download = "Relatório.csv";
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
	
		} catch (error) {
			console.error("Erro ao gerar CSV:", error);
		} finally {
			setLoading(false);
		}
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

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const endpoint = selectedCompanyId.length === 0
        ? `/template`
        : `/template/${selectedCompanyId[0]}`;

      const response = await api.get(endpoint, {
        params: {
          dateFrom,
          dateTo,
        },
      });

      if (Array.isArray(response.data)) {
        setTemplates(response.data);
      } else {
        console.error("A resposta da API não contém uma lista válida de templates.");
      }
    } catch (error) {
      console.error("Erro ao buscar templates:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const response = await api.get("/campaigns/all/a");
      const data = response.data;
      console.log("DataCampaign: ", data);

      if (Array.isArray(data)) {
        const filteredData = data.filter(c => c.status === "FINALIZADA" && c.templateId);
        setCampaigns(filteredData);
      } else {
        console.error("A resposta da API não contém uma lista válida de Campanhas.");
      }

    } catch (error) {
      console.error("Erro ao buscar campanhas:", error);
    } finally {
      setLoading(false);
    }

  }

  useEffect(() => {
    setFilteredData({
      companies,
    });
  }, [companies]);

  useEffect(() => {
    if (user) {
      fetchCompanies();
    }
  }, [user]);

  useEffect(() => {
    fetchTemplates();
  }, [dateFrom, dateTo, selectedCompanyId]);

  useEffect(() => {
    fetchCampaigns();
  }, []);

	const handleGenerateCSV = async () => {
		if (!Array.isArray(templates) || templates.length === 0) {
			console.error("Não há templates para gerar o relatório.");
			return;
		}
	
		setLoading(true);
		try {
			const reportData = templates.map((template) => ({
				Nome_do_Template: template.name || "N/A",
				Carteira: template.company?.name || "Desconhecida",
				Qtd_Disparos: campaigns.filter(c => c.templateId === template.id).length,
				Canal: "WhatsApp não oficial",
				Fornecedor: "Vend",
				Conteúdo_do_disparo_inicial: template.mainTemplate || "Sem conteúdo",
			}));
	
			const csv = Papa.unparse(reportData);
	
			console.log("Enviando dados para o backend:", { reportName: "Template.csv", url: csv });

			console.log("Preparando para enviar a requisição POST");
			const endpoint = `/template/${user?.companyId}/download-templateHistory`;

      const reportsResponse = await api.get(endpoint);
			console.log("Resposta da API após POST:", reportsResponse);
			console.log("response.data:", reportsResponse.data);
			
		} catch (error) {
			console.error("Erro ao gerar CSV:", error);
		} finally {
			setLoading(false);
		}
	};

  return (
    <MainContainer>
      <Box className={classes.mainContainer}>
        <Grid container spacing={2} justifyContent="center">
          <Grid item xs={12} sm={6} md={3}> 
            <Box className={classes.card}>
              <Typography variant="h5" className={classes.title}>
                {i18n.t("mainDrawer.listItems.templates")}
              </Typography>
              <Typography className={classes.description}>
                Gere relatórios detalhados sobre os templates utilizados nas campanhas.
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={() => setOpenTemplateModal(true)}
                className={classes.button}
              >
                {i18n.t("Relatório De Template")}
              </Button>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Box className={classes.card}>
              <Typography variant="h5" className={classes.title}>
                {i18n.t("mainDrawer.listItems.csv")}
              </Typography>
              <Typography className={classes.description}>
                Gere relatórios csv completos de todas ou uma carteira, com vários dados.
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={() => setOpenCSVModal(true)}
                className={classes.button}
              >
                {i18n.t("Relatório CSV")}
              </Button>
            </Box>
          </Grid>

          {/* Card 3 */}
          <Grid item xs={12} sm={6} md={3}> {/* Ajuste para 25% de largura em telas grandes */}
            <Box className={classes.card}>
              <Typography variant="h5" className={classes.title}>
                {i18n.t("mainDrawer.listItems.shooting")}
              </Typography>
              <Typography className={classes.description}>
                Gere um relatório e visualize os disparos realizados, com dados adicionais.
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={handleOpenPopup}
                className={classes.button}
              >
                {i18n.t("Relatório De Disparo")}
              </Button>
            </Box>
          </Grid>

          {/* Card 4 */}
          <Grid item xs={12} sm={6} md={3}> {/* Ajuste para 25% de largura em telas grandes */}
            <Box className={classes.card}>
              <Typography variant="h5" className={classes.title}>
                {i18n.t("mainDrawer.listItems.history")}
              </Typography>
              <Typography className={classes.description}>
                Gere um PDF com o histórico de conversas entre um operador e os clientes.
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={handleOpenHistoryModal}
                className={classes.button}
              >
                {i18n.t("Histórico de Conversas")}
              </Button>
            </Box>
          </Grid>
        </Grid>
    </Box>

    <div>
    <Box>
      {/* Relatório de Templates */}
			<div className={classes.section}>
      <Typography variant="h6" className={classes.sectionHeader}>
        Relatório de Templates
      </Typography>
      <TableContainer component={Paper} className={classes.tableContainer}>
        <Table className={classes.table} stickyHeader aria-label="relatórios de templates">
          <TableHead className={classes.tableHead}>
            <TableRow>
              <TableCell className={classes.tableCell}>Nome do Relatório</TableCell>
              <TableCell className={classes.tableCell}>Data de Geração</TableCell>
              <TableCell className={classes.tableCell}>Status</TableCell>
              <TableCell className={classes.tableButtonn}>Exportar</TableCell>
            </TableRow>
          </TableHead>
					<TableBody>
      {loading ? (
        <TableRow>
          <TableCell colSpan={4} className="tableCell">
            Carregando...
          </TableCell>
        </TableRow>
      ) : (
        reports.map((report, index) => (
          <TableRow key={index} className="tableRow">
            <TableCell className={classes.tableButton}>{report.reportName}</TableCell>
            <TableCell className={classes.tableButton}>
              {new Date(report.createdAt).toLocaleDateString()}
            </TableCell>
            <TableCell className={classes.tableButton}>Completo</TableCell>
            <TableCell className={classes.tableButton}>
              <Button
                variant="contained"
                color="secondary"
								style={{ borderColor: "#e22e00", color: "#e22e00" }}
                className="exportButton"
                startIcon={<BsDownload />}
								onClick={() => handleDownloadReport(report.id)}
              >
                Exportar
              </Button>
            </TableCell>
          </TableRow>
        ))
      )}
    </TableBody>

        </Table>
      </TableContainer>
    </div>

      {/* Relatório de CSV */}
      <div className={classes.section}>
        <Typography variant="h6" className={classes.sectionHeader}>
          Relatório CSV
        </Typography>
        <TableContainer component={Paper} className={classes.tableContainer}>
          <Table className={classes.table} stickyHeader aria-label="relatórios csv">
            <TableHead className={classes.tableHead}>
              <TableRow>
                <TableCell className={classes.tableCell}>Nome do Relatório</TableCell>
                <TableCell className={classes.tableCell}>Data de Geração</TableCell>
                <TableCell className={classes.tableCell}>Status</TableCell>
                <TableCell className={classes.tableButton}>Exportar</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reportData.csv.map((report, index) => (
                <TableRow key={index} className={classes.tableRow}>
                  <TableCell className={classes.tableCell}>{report.name}</TableCell>
                  <TableCell className={classes.tableCell}>{report.date}</TableCell>
                  <TableCell className={classes.tableCell}>{report.status}</TableCell>
                  <TableCell className={classes.tableButton}>
                    <Button variant="contained" color="primary" className={classes.exportButton}>
                      Exportar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>

      {/* Relatório de Disparo */}
       <div className={classes.section}>
        <Typography variant="h6" className={classes.sectionHeader}>
          Relatório de Disparo
        </Typography>
        <TableContainer component={Paper} className={classes.tableContainer}>
          <Table className={classes.table} stickyHeader aria-label="relatórios de disparo">
            <TableHead className={classes.tableHead}>
              <TableRow>
                <TableCell className={classes.tableCell}>Nome do Relatório</TableCell>
                <TableCell className={classes.tableCell}>Data de Geração</TableCell>
                <TableCell className={classes.tableCell}>Status</TableCell>
                <TableCell className={classes.tableButton}>Exportar</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reportData.shooting.map((report, index) => (
                <TableRow key={index} className={classes.tableRow}>
                  <TableCell className={classes.tableCell}>{report.name}</TableCell>
                  <TableCell className={classes.tableCell}>{report.date}</TableCell>
                  <TableCell className={classes.tableCell}>{report.status}</TableCell>
                  <TableCell className={classes.tableButton}>
                    <Button variant="contained" color="primary" className={classes.exportButton}>
                      Exportar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>

      <div className={classes.section}>
        <Typography variant="h6" className={classes.sectionHeader}>
          Relatório de Histórico
        </Typography>
        <TableContainer component={Paper} className={classes.tableContainer}>
          <Table className={classes.table} stickyHeader aria-label="relatórios de histórico">
            <TableHead className={classes.tableHead}>
              <TableRow>
                <TableCell className={classes.tableCell}>Nome do Relatório</TableCell>
                <TableCell className={classes.tableCell}>Data de Geração</TableCell>
                <TableCell className={classes.tableCell}>Status</TableCell>
                <TableCell className={classes.tableButton}>Exportar</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reportData.history.map((report, index) => (
                <TableRow key={index} className={classes.tableRow}>
                  <TableCell className={classes.tableCell}>{report.name}</TableCell>
                  <TableCell className={classes.tableCell}>{report.date}</TableCell>
                  <TableCell className={classes.tableCell}>{report.status}</TableCell>
                  <TableCell className={classes.tableButton}>
                    <Button variant="contained" color="primary" className={classes.exportButton}>
                      Exportar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div> 
    </Box>
    </div> 

      <div>
        <Dialog open={openTemplateModal}>
          <Backdrop open={loading} style={{ zIndex: 2000 }}>
            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" p={4} bgcolor="#fff" borderRadius={4} boxShadow={3}>
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
                    InputLabelProps={{ shrink: true }}
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
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                    margin="normal"
                  />
                </Grid>
              </Grid>

              <FormControl fullWidth margin="dense">
                <InputLabel>Selecionar uma carteira</InputLabel>
                <Select
                  multiple
                  value={selectedCompanyId}
                  onChange={handleCompanyChange}
                  renderValue={(selected) => selected
                    .map(id => filteredData.companies.find(c => c.id === id)?.name)
                    .join(", ")}
                >
                  {filteredData.companies.map((company) => (
                    <MenuItem key={company.id} value={company.id}>
                      <Checkbox checked={selectedCompanyId.includes(company.id)} />
                      <ListItemText primary={company.name} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

            </form>
          </DialogContent>

          <DialogActions>
            <Button color="primary" onClick={() => setOpenTemplateModal(false)}>
              Fechar
            </Button>
            <Button color="primary" variant="contained" disabled={loading} onClick={handleGenerateCSV}>
              Gerar Relatório de Template
            </Button>
          </DialogActions>
        </Dialog>
      </div>

      <div>
      <Dialog open={openCSVModal}>
					<Backdrop open={loading} style={{ zIndex: 2000 }}>
						<Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" p={4} bgcolor="#fff" borderRadius={4} boxShadow={3}>
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
										InputLabelProps={{ shrink: true }}
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
										InputLabelProps={{ shrink: true }}
										fullWidth
										margin="normal"
									/>
								</Grid>
							</Grid>

							<FormControl fullWidth margin="dense">
								<InputLabel>Selecionar uma carteira</InputLabel>
								<Select
									multiple
									value={selectedCompanyId}
									onChange={handleCompanyChange}
									renderValue={(selected) => selected.map(id => companies.find(c => c.id === id)?.name).join(", ")}
								>
									{companies.map((company) => (
										<MenuItem key={company.id} value={company.id}>
											<Checkbox checked={selectedCompanyId.includes(company.id)} />
											<ListItemText primary={company.name} />
										</MenuItem>
									))}
								</Select>
							</FormControl>
						</form>
					</DialogContent>

					<DialogActions>
						<Button onClick={() => setOpenCSVModal(false)} color="primary">
							Fechar
						</Button>
						<Button onClick={handleGenerateReport} color="primary" variant="contained" disabled={loading}>
							Gerar relatório
						</Button>
					</DialogActions>
				</Dialog>
      </div>

      <div>
				<Dialog open={openPopup} onClose={handleClosePopup}>
					<Backdrop open={loading} style={{ zIndex: 2000 }}>
						<Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" p={4} bgcolor="#fff" borderRadius={4} boxShadow={3}>
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
										InputLabelProps={{ shrink: true }}
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
										InputLabelProps={{ shrink: true }}
										fullWidth
										margin="normal"
									/>
								</Grid>
							</Grid>

							<FormControl fullWidth margin="dense">
								<InputLabel>Selecionar uma carteira</InputLabel>
								<Select
									multiple
									value={selectedCompanyId}
									onChange={handleCompanyChange}
									renderValue={(selected) => selected.map(id => companies.find(c => c.id === id)?.name).join(", ")}
								>
									{companies.map((company) => (
										<MenuItem key={company.id} value={company.id}>
											<Checkbox checked={selectedCompanyId.includes(company.id)} />
											<ListItemText primary={company.name} />
										</MenuItem>
									))}
								</Select>
							</FormControl>
						</form>
					</DialogContent>

					<DialogActions>
						<Button onClick={handleClosePopup} color="primary">
							Fechar
						</Button>
						<Button onClick={handleGenerateHistoryCSV} color="primary" variant="contained" disabled={loading}>
							Gerar Relatório de Disparo
						</Button>
					</DialogActions>
				</Dialog>
			</div>

      <HistoryModal
				open={openHistoryModal}
				onClose={handleCloseHistoryModal}
				loading={loading}
			/>
    </MainContainer>
  );
};

export default Relatories;