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
import { Backdrop, Box, Checkbox, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, Grid, InputLabel, ListItemText, MenuItem, Select, Typography } from "@material-ui/core";
import Papa from "papaparse";
import moment from "moment";
import { listCompanies } from "../../services/company";
import toastError from "../../errors/toastError";

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(1),
    overflowY: "scroll",
    ...theme.scrollbarStyles,
  },
}));

const CsvTemplate = () => {
  const classes = useStyles();

  const [loading, setLoading] = useState(false);
  const [openPopup, setOpenPopup] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [dateFrom, setDateFrom] = useState(moment("1", "D").format("YYYY-MM-DD"));
  const [dateTo, setDateTo] = useState(moment().format("YYYY-MM-DD"));
  const [selectedCompanyId, setSelectedCompanyId] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [campaigns, setCampaigns] = useState([]); 
  const { user } = useContext(AuthContext);
  const [filteredData, setFilteredData] = useState({
    companies: [],
  });

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
    try{
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

  const fetchTickets = async () => {
    try {
      const endpoint = user?.companyId === 1 ? "/tickets/list" : "/tickets";
      const response = await api.get(endpoint);
  
      if (Array.isArray(response.data.tickets)) {
        return response.data.tickets; 
      } else {
        console.error("A resposta da API não contém uma lista válida de tickets.");
        return [];
      }
    } catch (error) {
      console.error("Erro ao buscar tickets:", error);
      return [];
    }
  };
  

  useEffect(() => {
    if (user) {
      fetchTickets();
    }
  }, [user]);

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

  const handleCompanyChange = (e) => {
    const selectedCompanies = e.target.value;
    setSelectedCompanyId(selectedCompanies === "" ? [] : selectedCompanies);
  };

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
      const tickets = await fetchTickets(); 
      const reportData = templates.map((template) => {
        const ticketsForTemplate = tickets.filter((ticket) => ticket.templateId === template.id);
        const templateResponseCount = ticketsForTemplate.reduce(
          (acc, ticket) => acc + (ticket.templateResponseCount || 0), 
          0
        );
  
        return {
          Nome_do_Template: template.name || "N/A",
          Carteira: template.company?.name || "Desconhecida",
          Qtd_Disparos: ticketsForTemplate.length,  
          Canal: "WhatsApp não oficial",
          Fornecedor: "Vend",
          Conteúdo_do_disparo_inicial: template.mainTemplate || "Sem conteúdo",
          Quantidade_de_resposta_ao_template: templateResponseCount || "Sem Conteúdo", 
        };
      });
  
      const csv = Papa.unparse(reportData);
  
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "relatorio_template.csv";
      link.click();
    } catch (error) {
      console.error("Erro ao gerar CSV:", error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <MainContainer>
      <MainHeader>
        <Title>{i18n.t("mainDrawer.listItems.templates")}</Title>
        <MainHeaderButtonsWrapper>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setOpenPopup(true)}
            style={{ fontWeight: "bold" }}
          >
            {i18n.t("Relatório De Template")}
          </Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>

      <div>
        <Dialog open={openPopup}>
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
            <Button color="primary" onClick={() => setOpenPopup(false)}>
              Fechar
            </Button>
            <Button color="primary" variant="contained" disabled={loading} onClick={handleGenerateCSV}>
              Gerar Relatório de Template
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </MainContainer>
  );
};

export default CsvTemplate;
