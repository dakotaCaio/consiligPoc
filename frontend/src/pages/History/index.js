import React, { useState, useEffect, useCallback, useContext } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import InputAdornment from "@material-ui/core/InputAdornment";
import SearchIcon from "@material-ui/icons/Search";
import { i18n } from "../../translate/i18n";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import HistoryModal from "../../components/HistoryModal";
import { AuthContext } from "../../context/Auth/AuthContext";
import { toast } from "react-toastify";
import api from "../../services/api";
import jsPDF from "jspdf";
import toastError from "../../errors/toastError";

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(1),
    overflowY: "scroll",
    ...theme.scrollbarStyles,
  },
}));

const History = () => {
  const classes = useStyles();
  const { user } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [openHistoryModal, setOpenHistoryModal] = useState(false);
  const [searchParam, setSearchParam] = useState("");

  const handleOpenHistoryModal = () => {
    setOpenHistoryModal(true);
  };

  const handleCloseHistoryModal = () => {
    setOpenHistoryModal(false);
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

  const handleSearch = (event) => {
    setSearchParam(event.target.value.toLowerCase());
  };

  return (
    <MainContainer>
      <MainHeader>
        <Title>{i18n.t("mainDrawer.listItems.history")}</Title>
        <MainHeaderButtonsWrapper>
          <Button
            variant="contained"
            color="primary"
            onClick={handleOpenHistoryModal}
            style={{ fontWeight: "bold" }}
          >
            {i18n.t("add")}
          </Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>

      <HistoryModal
        open={openHistoryModal}
        onClose={handleCloseHistoryModal}
        onGenerateReport={handleDownloadPDF}
        loading={loading}
      />
    </MainContainer>
  );
};

export default History;
