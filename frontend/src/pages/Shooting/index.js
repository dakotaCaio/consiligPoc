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
  titleCard: {
    padding: theme.spacing(3),
    backgroundColor: "#fff",
    borderRadius: 8,
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
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
	const [companies, setCompanies] = useState([]);
	const [attendants, setAttendants] = useState([]);
	const [period, setPeriod] = useState(0);
	const [filterType, setFilterType] = useState(1);
	const [dateFrom, setDateFrom] = useState(moment("1", "D").format("YYYY-MM-DD"));
	const [dateTo, setDateTo] = useState(moment().format("YYYY-MM-DD"));
	const [tickets, setTickets] = useState([]);
	const { find } = useDashboard();
	const { user } = useContext(AuthContext);
  const [openPopupMessages, setOpenPopupMessages] = useState(false);

	const handleOpenHistoryModal = () => {
		setOpenHistoryModal(true);
	};

	const handleCloseHistoryModal = () => {
		setOpenHistoryModal(false);
	};

  const handleOpenPopup = () => setOpenPopup(true);
	const handleClosePopup = () => setOpenPopup(false);
	const handleOpenPopupMessages = () => setOpenPopupMessages(true);
	const handleClosePopupMessages = () => setOpenPopupMessages(false);


  const handleCompanyChange = (e) => {
    const selectedCompanies = e.target.value;
    setSelectedCompanyId(selectedCompanies === "" ? [] : selectedCompanies);
    console.log("Empresas selecionadas:", selectedCompanies);
};

	const [filteredData, setFilteredData] = useState({
		companies: [],
		tickets: [],
	});

	const handleApplyFilters = (filteredResults) => {
		setFilteredData(filteredResults);
		setTickets(filteredResults.tickets);
	};

	useEffect(() => {
		setFilteredData({
			companies,
			tickets,
		});
	}, [companies, tickets]);

	const fetchCompanies = async () => {
		try {
			const endpoint = user?.companyId === 1 ? "/companies/list" : "/companies";
			const companiesResponse = await listCompanies(endpoint);

			if (Array.isArray(companiesResponse)) {
				setCompanies(companiesResponse);
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
  
	return (
		<MainContainer>
			<header>
				<div className={classes.headerWrapper}>
				<Title>{i18n.t("mainDrawer.listItems.shooting")}</Title>
					<Button
						variant="contained"
						color="primary"
						onClick={handleOpenPopup}
						style={{ fontWeight: "bold" }}
					>
						{i18n.t("Relatório De Disparo")}
					</Button>
				</div>
			</header>

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

export default CsvReport;
