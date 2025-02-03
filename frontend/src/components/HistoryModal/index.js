import React, { useState, useContext } from "react";
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, TextField, Backdrop, CircularProgress, Box, Typography, FormControl } from "@material-ui/core";
import { i18n } from "../../translate/i18n";
import { AuthContext } from "../../context/Auth/AuthContext";

const HistoryModal = ({ open, onClose, onGenerateReport, loading }) => {
  const { user } = useContext(AuthContext);
  const [inputValue, setInputValue] = useState("");

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  return (
    <Dialog open={open} onClose={onClose}>
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
      <DialogTitle>{i18n.t("mainDrawer.listItems.history")}</DialogTitle>
      <DialogContent style={{ maxHeight: '400px', overflowY: 'auto' }}>
        <form>
          <div>
            {user.companyId === 1 && (
              <FormControl margin="dense" variant="outlined" fullWidth>
                <TextField
                  label={i18n.t("Digite um número")}
                  id="dialog-insert-number"
                  name="number"
                  value={inputValue}
                  onChange={handleInputChange}
                  fullWidth
                />
              </FormControl>
            )}
          </div>
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          {i18n.t("Fechar")}
        </Button>
        <Button
          onClick={() => onGenerateReport(inputValue)}
          color="primary"
          variant="contained"
          disabled={loading}
        >
          {i18n.t("Gerar Histórico")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default HistoryModal;
