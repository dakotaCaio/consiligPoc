import React from "react";
import ReactDOM from "react-dom";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material"; // Corrigido para a versão mais recente do MUI
import App from "./App";

// Criação do tema com a fonte Poppins
const theme = createTheme({
  typography: {
    fontFamily: 'Poppins, Arial, sans-serif', // Define a nova fonte padrão
  },
});

ReactDOM.render(
  <ThemeProvider theme={theme}> {/* Aplica o tema do MUI */}
    <CssBaseline /> {/* Aplica os estilos globais do MUI */}
    <App /> {/* Componente principal da aplicação */}
  </ThemeProvider>,
  document.getElementById("root")
);