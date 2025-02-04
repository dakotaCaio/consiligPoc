import React, { useState, useEffect, useCallback, useContext } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Papa from 'papaparse';
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import InputAdornment from "@material-ui/core/InputAdornment";
import SearchIcon from "@material-ui/icons/Search";
import { i18n } from "../../translate/i18n";
import MainContainer from "../../components/MainContainer";
import { isEmpty } from "lodash";
import { isArray, size, unset } from "lodash";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import HistoryModal from "../../components/HistoryModal";
import { AuthContext } from "../../context/Auth/AuthContext";
import { toast } from "react-toastify";
import api from "../../services/api";
import jsPDF from "jspdf";
import toastError from "../../errors/toastError";
import { Backdrop, Box, Checkbox, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, Grid, InputLabel, ListItemText, MenuItem, Select, Typography } from "@material-ui/core";
import Bluebird from "bluebird";
import moment from "moment";
import useDashboard from "../../hooks/useDashboard";
import { listTickets } from "../../services/tickets";

const useStyles = makeStyles((theme) => ({
	mainPaper: {
		flex: 1,
		padding: theme.spacing(1),
		overflowY: "scroll",
		...theme.scrollbarStyles,
	},
	headerWrapper: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
		marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
	buttonCard: {
    display: "flex",
    justifyContent: "center",
    marginTop: theme.spacing(3),
    padding: theme.spacing(3),
  },
  button: {
    fontWeight: "bold",
    borderRadius: "6px",
    padding: "5px 2rem",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    transition: "background-color 0.3s ease",
    "&:hover": {
      backgroundColor: theme.palette.primary.dark,
    },
  },
}));

const CsvReport = () => {
	const classes = useStyles();

	const [loading, setLoading] = useState(false);
	const [openHistoryModal, setOpenHistoryModal] = useState(false);
	const [searchParam, setSearchParam] = useState("");
	const [selectedCompanyId, setSelectedCompanyId] = useState([]);
	const [openPopup, setOpenPopup] = useState(false);
	const [openPopupMessages, setOpenPopupMessages] = useState(false);
	const [companies, setCompanies] = useState([]);
	const [counters, setCounters] = useState({});
	const [attendants, setAttendants] = useState([]);
	const [period, setPeriod] = useState(0);
	const [filterType, setFilterType] = useState(1);
	const [dateFrom, setDateFrom] = useState(moment("1", "D").format("YYYY-MM-DD"));
	const [dateTo, setDateTo] = useState(moment().format("YYYY-MM-DD"));
	const [users, setUsers] = useState([]);
	const { find } = useDashboard();
	const [whatsAppSessions, setWhatsAppSessions] = useState([]);
	const [status, setStatus] = useState("");
	const [selectedOption, setSelectedOption] = useState('chatsUser');
	const [tickets, setTickets] = useState([]);
	const [inputValue, setInputValue] = useState('');

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
				"Id", "Carteira", "Nome do Cliente", "Telefone", "CNPJ/CPF", "Contrato", "Nome do Operador", "CPF Operador", "Tabulação", "status", "Primeiro atendimento", "Último Atendimento", "Enviado", "Confirmado", "Falha", "Leitura", "Interação"
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

	return (
		<MainContainer>
			<header>
				<div className={classes.headerWrapper}>
				<Title>{i18n.t("mainDrawer.listItems.csv")}</Title>
					<Button
						variant="contained"
						color="primary"
						onClick={handleOpenPopup}
						style={{ fontWeight: "bold" }}
					>
						{i18n.t("Relatório")}
					</Button>
				</div>
			</header>

			<div>
				{/* Modal de Relatório */}
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
						<Button onClick={handleGenerateReport} color="primary" variant="contained" disabled={loading}>
							Gerar relatório
						</Button>
					</DialogActions>
				</Dialog>
			</div>

			{/* Modal Histórico */}
			<HistoryModal
				open={openHistoryModal}
				onClose={handleCloseHistoryModal}
				loading={loading}
			/>
		</MainContainer>
	);
};

export default CsvReport;
