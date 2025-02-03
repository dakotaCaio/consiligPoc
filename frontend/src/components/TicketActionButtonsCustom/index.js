import React, { useContext, useState } from "react";
import { useHistory } from "react-router-dom";
import { makeStyles, createTheme, ThemeProvider } from "@material-ui/core/styles";
import { IconButton } from "@material-ui/core";
import { MoreVert, Replay } from "@material-ui/icons";
import { jsPDF } from "jspdf";

import { FaFileDownload } from "react-icons/fa";
import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import TicketOptionsMenu from "../TicketOptionsMenu";
import ButtonWithSpinner from "../ButtonWithSpinner";
import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";
import { TicketsContext } from "../../context/Tickets/TicketsContext";
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import UndoRoundedIcon from '@material-ui/icons/UndoRounded';
import Tooltip from '@material-ui/core/Tooltip';
import { green } from '@material-ui/core/colors';


const useStyles = makeStyles(theme => ({
	actionButtons: {
		marginRight: 6,
		flex: "none",
		alignSelf: "center",
		marginLeft: "auto",
		"& > *": {
			margin: theme.spacing(0.5),
		},
	},
}));

const TicketActionButtonsCustom = ({ ticket }) => {
	const classes = useStyles();
	const history = useHistory();
	const [anchorEl, setAnchorEl] = useState(null);
	const [loading, setLoading] = useState(false);
	const ticketOptionsMenuOpen = Boolean(anchorEl);
	const { user } = useContext(AuthContext);
	const { setCurrentTicket } = useContext(TicketsContext);

	const customTheme = createTheme({
		palette: {
		  	primary: green,
		}
	});

	const handleOpenTicketOptionsMenu = e => {
		setAnchorEl(e.currentTarget);
	};

	const handleCloseTicketOptionsMenu = e => {
		setAnchorEl(null);
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

	const handleUpdateTicketStatus = async (e, status, userId) => {
		setLoading(true);
		try {
			await api.put(`/tickets/${ticket.id}`, {
				status: status,
				userId: userId || null,
				useIntegration: status === "closed" ? false : ticket.useIntegration,
				promptId: status === "closed" ? false : ticket.promptId,
				integrationId: status === "closed" ? false : ticket.integrationId
			});

			setLoading(false);
			if (status === "open") {
				setCurrentTicket({ ...ticket, code: "#open" });
			} else {
				setCurrentTicket({ id: null, code: null })
				history.push("/tickets");
			}
		} catch (err) {
			setLoading(false);
			const errorMessage = err.response?.data?.message || "O ticket não pode ser fechado sem um Status.";
			toastError(errorMessage);
		}
	};

	const handleDownloadPDF = async () => {
		try {
			console.log("Iniciando download do PDF...");
			const response = await api.get(`/messages/${ticket.id}`);
			console.log("Resposta completa:", response);
			console.log("Dados recebidos:", response.data);
	
			const messages = response.data.messages;  
	
			if (!Array.isArray(messages)) {
				toastError("Os dados de mensagens não estão no formato esperado.");
				return;
			}
	
			if (messages.length === 0) {
				toastError("Nenhuma mensagem encontrada para este ticket.");
				return;
			}
	
			const doc = new jsPDF();
			doc.setFontSize(12);
			doc.text(`Histórico de Mensagens - Ticket ID: ${ticket.id} | Atendente: ${user.name}`, 10, 10);
			doc.line(10, 15, 200, 15);
	
			let yPosition = 20;
			const lineHeight = 10;
			const pageHeight = 280;
	
			messages.forEach((message, index) => {
				const author = message.contact?.name || user.name; 
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

			doc.save(`Histórico de Mensagens TicketId:${ticket.id}.pdf`);
		} catch (err) {
			console.error("Erro ao gerar o PDF:", err);
			toastError("Erro ao gerar o PDF. Tente novamente.");
		}
	};
	
	return (
		<div className={classes.actionButtons}>
			<Tooltip title={i18n.t("Histórico PDF")}>
				<IconButton
					size="small"
					color="primary"
					onClick={handleDownloadPDF}
					loading={loading}
				>
					<FaFileDownload />
				</IconButton>
				</Tooltip>
			{ticket.status === "closed" && (
				<ButtonWithSpinner
					loading={loading}
					startIcon={<Replay />}
					size="small"
					onClick={e => handleUpdateTicketStatus(e, "open", user?.id)}
				>
					{i18n.t("messagesList.header.buttons.reopen")}
				</ButtonWithSpinner>
			)}
			{ticket.status === "open" && (
				<>
					<Tooltip title={i18n.t("messagesList.header.buttons.return")}>
						<IconButton onClick={e => handleUpdateTicketStatus(e, "pending", null)}>
							<UndoRoundedIcon />
						</IconButton>
					</Tooltip>
					<ThemeProvider theme={customTheme}>
						<Tooltip title={i18n.t("messagesList.header.buttons.resolve")}>
							<IconButton onClick={e => handleUpdateTicketStatus(e, "closed", user?.id)} color="primary">
								<CheckCircleIcon />
							</IconButton>
						</Tooltip>
					</ThemeProvider>
					{/* <ButtonWithSpinner
						loading={loading}
						startIcon={<Replay />}
						size="small"
						onClick={e => handleUpdateTicketStatus(e, "pending", null)}
					>
						{i18n.t("messagesList.header.buttons.return")}
					</ButtonWithSpinner>
					<ButtonWithSpinner
						loading={loading}
						size="small"
						variant="contained"
						color="primary"
						onClick={e => handleUpdateTicketStatus(e, "closed", user?.id)}
					>
						{i18n.t("messagesList.header.buttons.resolve")}
					</ButtonWithSpinner> */}
					<IconButton onClick={handleOpenTicketOptionsMenu}>
						<MoreVert />
					</IconButton>
					<TicketOptionsMenu
						ticket={ticket}
						anchorEl={anchorEl}
						menuOpen={ticketOptionsMenuOpen}
						handleClose={handleCloseTicketOptionsMenu}
					/>
				</>
			)}
			{ticket.status === "pending" && (
				<ButtonWithSpinner
					loading={loading}
					size="small"
					variant="contained"
					color="primary"
					onClick={e => handleUpdateTicketStatus(e, "open", user?.id)}
				>
					{i18n.t("messagesList.header.buttons.accept")}
				</ButtonWithSpinner>
			)}
		</div>
	);
};

export default TicketActionButtonsCustom;
