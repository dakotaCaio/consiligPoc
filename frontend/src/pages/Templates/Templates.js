import React, { useState, useEffect, useContext, useReducer } from "react";
import { toast } from "react-toastify";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import EditIcon from "@material-ui/icons/Edit";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import { AuthContext } from "../../context/Auth/AuthContext";
import TemplatesModal from "../../components/TemplatesModal/TemplatesModal";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import { IconButton } from "@material-ui/core";
import ConfirmationModal from "../../components/ConfirmationModal";
import toastError from "../../errors/toastError";

const reducer = (state, action) => {
  switch (action.type) {
    case "LOAD_TEMPLATES":
      return [...action.payload];

    case "ADD_TEMPLATE":
      return [action.payload, ...state];

    case "UPDATE_TEMPLATE":
      return state.map((template) =>
        template.id === action.payload.id ? action.payload : template
      );

    case "DELETE_TEMPLATE":
      return state.filter((template) => template.id !== action.payload);

    default:
      return state;
  }
};
const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(1),
    overflowY: "scroll",
    ...theme.scrollbarStyles,
  },
  templateTitle: {
    color: "#1c2027"
  },
  divMain: {
    display: "flex",
    justifyContent: "space-between",
    width: "100%",
  }
}));

const Templates = () => {
  const classes = useStyles();
  const [loading, setLoading] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const { user } = useContext(AuthContext);
  const [open, setOpen] = useState(false);
  const [templates, dispatch] = useReducer(reducer, []);
  const [deleteTemplate, setDeleteTemplate] = useState(null);
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  useEffect(() => {
    if (user?.companyId) {
      const fetchTemplates = async () => {
        setLoading(true);
        try {
          const response = await api.get(`/template/${user.companyId}`);
          console.log("Templates buscados:", response.data);

          const templatesData = Array.isArray(response.data) ? response.data : [];

          dispatch({ type: "LOAD_TEMPLATES", payload: templatesData });
        } catch (error) {
          toast.error("Erro ao carregar os templates.");
          dispatch({ type: "LOAD_TEMPLATES", payload: [] });
        } finally {
          setLoading(false);
        }
      };

      fetchTemplates();
    }
  }, [user?.companyId]);

  const handleSave = async (formData) => {
    try {
      let response;

      const templateData = {
        name: formData.nome,
        mainTemplate: formData.templatePrincipal,
        retryTemplate: formData.templateRepescagem1,
        lastTemplate: formData.templateRepescagem2, 
      };

      if (selectedTemplate) {
        response = await api.put(`/template/${selectedTemplate.id}/${user.companyId}`, templateData);
        toast.success("Template editado com sucesso!");
      } else {
        response = await api.post(`/template/${user.companyId}`, templateData);
        toast.success("Template criado com sucesso!");
      }

      dispatch({
        type: selectedTemplate ? "UPDATE_TEMPLATE" : "ADD_TEMPLATE",
        payload: response.data,
      });

      handleCloseTemplateModal();
    } catch (error) {
      toast.error("Erro ao salvar o template.");
    }
  };



  const handleEditTemplate = (template) => {
    setSelectedTemplate(template);
    setTemplateModalOpen(true);
  };

  const handleCloseTemplateModal = () => {
    setSelectedTemplate(null);
    setTemplateModalOpen(false);
  };

  const handleDeleteTemplate = async (templateId) => {
    try {
      await api.delete(`/template/${templateId}/${user.companyId}`);
      toast.success(i18n.t("Template deletado com sucesso!"));
      dispatch({ type: "DELETE_TEMPLATE", payload: templateId });
    } catch (err) {
      toastError(err);
    } finally {
      setDeleteTemplate(null);
    }
  };

  const handleClose = () => setOpen(false);


  const openConfirmDeleteModal = (template) => {
    setDeleteTemplate(template);
    setConfirmModalOpen(true);
  };

  const confirmDelete = () => {
    if (deleteTemplate) {
      handleDeleteTemplate(deleteTemplate.id);
    }
    setConfirmModalOpen(false);
  };


  const handleOpen = () => {
    console.log("Abrindo o modal...");
    setTemplateModalOpen(true); 
  };
  
  return (
    <MainContainer>
      <ConfirmationModal
        title={`${i18n.t("mainDrawer.listItems.deletet")} ${deleteTemplate?.name}?`} 
        open={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={confirmDelete}
      >
        {i18n.t("Eu confirmo que desejo deletar esse template")}
      </ConfirmationModal>

      <TemplatesModal
  open={templateModalOpen}
  onClose={handleCloseTemplateModal}
  onSave={handleSave}
  initialData={selectedTemplate}
  aria-labelledby="form-dialog-title"
/>

<MainHeader>
  <MainHeaderButtonsWrapper>
    <div className="templateHeader" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
      <Title>
        <span className={classes.templateTitle}>TEMPLATES</span>
      </Title>
      <Button 
  variant="contained" 
  onClick={handleOpen} 
  style={{ marginLeft: "auto" }}
>
  + Template
</Button>

      </div>
  </MainHeaderButtonsWrapper>
</MainHeader>


      <Paper className={classes.mainPaper} variant="outlined" style={{ borderRadius: "15px" }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell align="center">{i18n.t("ID do Template")}</TableCell>
              <TableCell align="center">{i18n.t("Nome")}</TableCell>
              <TableCell align="center">{i18n.t("Template Principal")}</TableCell>
              <TableCell align="center">{i18n.t("Template secundário")}</TableCell>
              <TableCell align="center">{i18n.t("Template terciário")}</TableCell>
              <TableCell align="center">{i18n.t("Ações")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRowSkeleton columns={6} />
            ) : (
              templates
                .filter((template) => template.name.toLowerCase().includes(searchParam))
                .map((template) => (
                  <TableRow key={template.id}>
                    <TableCell align="center">{template.id}</TableCell>
                    <TableCell align="center">{template.name}</TableCell>
                    <TableCell align="center">{template.mainTemplate}</TableCell>
                    <TableCell align="center">{template.retryTemplate}</TableCell>
                    <TableCell align="center">{template.lastTemplate}</TableCell>
                    <TableCell align="center">
                      <IconButton size="small" onClick={() => handleEditTemplate(template)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => openConfirmDeleteModal(template)}
                      >
                        <DeleteOutlineIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>

        </Table>
      </Paper>
    </MainContainer>
  );
};
export default Templates;
