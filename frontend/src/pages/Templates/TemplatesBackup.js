import React, { useState, useEffect, useReducer, useContext } from "react";
import { toast } from "react-toastify";

import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import IconButton from "@material-ui/core/IconButton";
import SearchIcon from "@material-ui/icons/Search";
import TextField from "@material-ui/core/TextField";
import InputAdornment from "@material-ui/core/InputAdornment";

import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import EditIcon from "@material-ui/icons/Edit";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";

import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import UserModal from "../../components/UserModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import toastError from "../../errors/toastError";
import { SocketContext } from "../../context/Socket/SocketContext";
import { AuthContext } from "../../context/Auth/AuthContext";
import { FormControl, Select } from "@material-ui/core";
import TemplatesModal from "../../components/TemplatesModal/TemplatesModal";
import { FaPlus } from "react-icons/fa6";

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(1),
    overflowY: "scroll",
    ...theme.scrollbarStyles,
  },
  mainPaper: {
    flex: 1,
    padding: theme.spacing(1),
    overflowY: "scroll",
    ...theme.scrollbarStyles
  },
  templateTitle: {
    color: "#1c2027",
    "&::before":{
      content: '""', // String válida para o content
      width: 450, // Certifique-se de usar unidades
      height: 3, // Corrigido de "heigth" para "height"
      backgroundColor: "#a70c35 ",
      display: "inline-block", // Necessário para que o pseudo-elemento seja vis
      position: "absolute",
      top: 90
    },
  },
  templateWrapper: {
    backgroundColor: "#f2e9eb",
    padding: "3rem",
    height: "100vh"
  },
  templateAddButtom: {
    fontSize: "21px !important",
    backgroundColor: "transparent",
    boxShadow: "none",
    "&:hover": {
      backgroundColor: "red"
    }
  },
  templateAddButtomIcon: {
    marginRight: 16
  }
}));

const Templates = () => {
  const classes = useStyles();

  return (
    <MainContainer>
      <ConfirmationModal
        title={`${i18n.t("users.confirmationModal.deleteTitle")} ${
          deletingUser?.name
        }?`}
        open={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={() => handleDeleteUser(deletingUser.id)}
      >
        {i18n.t("users.confirmationModal.deleteMessage")}
      </ConfirmationModal>

      <UserModal
        open={userModalOpen}
        onClose={handleCloseUserModal}
        aria-labelledby="form-dialog-title"
        userId={selectedUser?.id}
      />

      <MainHeaderButtonsWrapper>
        <Title>
          <span className={classes.templateTitle}>TEMPLATES</span>
        </Title>
        <Paper className={classes.templateWrapper}>
          <Button
            className={classes.templateAddButtom}
            variant="contained"
            onClick={handleOpen}
          >
            <FaPlus className={classes.templateAddButtomIcon} />
            <span>Adicionar</span>
          </Button>
          <TemplatesModal
            open={open}
            onClose={handleClose}
            onSubmit={handleSubmit}
          />
        </Paper>
      </MainHeaderButtonsWrapper>
      
    
    </MainContainer>
  );
};

export default Templates;