import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
} from "@material-ui/core";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";

const TemplateSelectionModal = ({ open, onClose, onSelectTemplate, companyId }) => {
  const [templates, setTemplates] = useState([]);

  useEffect(() => {
    if (open) {
      // Busca os templates da API
      api
        .get(`/template/${companyId}`)
        .then(({ data }) => setTemplates(data.templates || []))
        .catch((err) => console.error("Erro ao buscar templates:", err));
    }
  }, [open, companyId]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{i18n.t("campaigns.dialog.selectTemplate")}</DialogTitle>
      <DialogContent dividers>
        <List>
          {templates.map((template) => (
            <ListItem
              button
              key={template.id}
              onClick={() => onSelectTemplate(template)}
            >
              <ListItemText
                primary={template.name}
                secondary={template.mainTemplate}
              />
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          {i18n.t("campaigns.dialog.cancel")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TemplateSelectionModal;