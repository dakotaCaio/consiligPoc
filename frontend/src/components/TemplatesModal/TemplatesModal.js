import React, { useState, useEffect } from "react";
import { Modal, Box, Typography, TextField, Button } from "@mui/material";
import { makeStyles } from "@material-ui/core/styles";
import clsx from 'clsx';

const useStyles = makeStyles((theme) => ({
    modalHeader: {
        backgroundColor: "#1C2027",
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
        display: "flex",
        color: "#ffffff",
        padding: 16,
        alignItems: "center",
        gap: 16
    },
    span: {
      marginLeft: 32,
      color: "#a70c35"
    }
}));

const TemplatesModal = ({ open, onClose, onSave, initialData }) => {
  const classes = useStyles();

  console.log('Modal open', open)

  const [formData, setFormData] = useState({
    nome: "",
    templatePrincipal: "",
    templateRepescagem1: "",
    templateRepescagem2: "",
  });
  useEffect(() => {
    if (initialData) {
      setFormData({
        nome: initialData.name || "",
        templatePrincipal: initialData.mainTemplate || "",
        templateRepescagem1: initialData.retryTemplate || "",
        templateRepescagem2: initialData.lastTemplate || "",
      });
    } else {
    
      setFormData({
        nome: "",
        templatePrincipal: "",
        templateRepescagem1: "",
        templateRepescagem2: "",
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = () => {
    console.log('Dados do formulário:', formData);
    onSave(formData);  
    onClose(); 
  };

  return (
    <Modal open={open} onClose={onClose} className="  ">
      <Box
        sx={{
          position: "absolute",
          display: "flex",
          flexFlow: "column",
          gap: "1rem",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "50%",
          bgcolor: "background.paper",  
          borderRadius: "15px",
          boxShadow: 24
        }}
      >
        <header className={clsx(classes.modalHeader,"template-modal")}>
          <Typography variant="h6" component="h2" sx={{ mb: 2 }} style={{ whiteSpace: "nowrap" }}>
            Nome do template:
          </Typography>
          <TextField
            label="Template..."
            name="nome"
            value={formData.nome}
            onChange={handleChange}
            fullWidth
            sx={{ mb: 2 }}
          />
        </header>

        <main style={{ display: "flex", flexFlow: "column", justifyContent: "flex-start" }}>
          <TextField
            name="templatePrincipal"
            value={formData.templatePrincipal}
            onChange={handleChange}
            fullWidth
            label="Template Principal"
            className="template"
            sx={{ mb: 2 }}
          />
          <TextField
            name="templateRepescagem1"
            value={formData.templateRepescagem1}
            onChange={handleChange}
            fullWidth
            label="Template de Repescagem 1"
            className="template"
            sx={{ mb: 2 }}
          />
          <TextField
            name="templateRepescagem2"
            value={formData.templateRepescagem2}
            onChange={handleChange}
            fullWidth
            label="Template de Repescagem 2"
            className="template"
            sx={{ mb: 2 }}
          />
        </main>

        <footer>
          <Box sx={{ textAlign: "right", display: "flex", justifyContent: "space-between", padding: "1rem" }}>
            <Button onClick={onClose} sx={{ mr: 2 }} style={{ width: "200px", border: "1px solid #a70c35", borderRadius: "9px", color: "#1C2027" }}>
              Cancelar
            </Button>
            <Button variant="contained" onClick={handleSubmit} style={{ width: "200px", backgroundColor: "#1C2027", borderRadius: "9px" }}>
              Salvar
            </Button>
          </Box>
        </footer>
      </Box>
    </Modal>
  );
};

export default TemplatesModal;
