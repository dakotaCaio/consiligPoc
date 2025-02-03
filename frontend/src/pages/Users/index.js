import React, { useState, useEffect, useReducer, useContext } from "react";
import { toast } from "react-toastify";
import { parse } from "json2csv";

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

const reducer = (state, action) => {
  switch (action.type) {
    case "LOAD_USERS":
      const users = Array.isArray(action.payload) ? action.payload : [];
      const newUsers = [];

      users.forEach((user) => {
        const userIndex = state.findIndex((u) => u.id === user.id);
        if (userIndex !== -1) {
          state[userIndex] = user;
        } else {
          newUsers.push(user);
        }
      });

      return [...state, ...newUsers];

    case "UPDATE_USERS":
      const user = action.payload;
      const userIndex = state.findIndex((u) => u.id === user.id);
      if (userIndex !== -1) {
        state[userIndex] = user;
        return [...state];
      }
      return [user, ...state];

    case "DELETE_USER":
      const userId = action.payload;
      const userToDeleteIndex = state.findIndex((u) => u.id === userId);
      if (userToDeleteIndex !== -1) {
        state.splice(userToDeleteIndex, 1);
      }
      return [...state];

    case "RESET":
      return [];

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
}));

const Users = () => {
  const classes = useStyles();

  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [users, dispatch] = useReducer(reducer, []);
  const [companies, setCompanies] = useState([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState("");

  const { user } = useContext(AuthContext);
  const socketManager = useContext(SocketContext);

  useEffect(() => {
    if (user?.companyId === 1) {
      const fetchCompanies = async () => {
        try {
          const endpoint = "/companies/list"; 
          const { data } = await api.get(endpoint);
          setCompanies(Array.isArray(data) ? data : []);
        } catch (err) {
          toastError(err);
        }
      };
      fetchCompanies();
    }
  }, [user?.companyId]);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setLoading(true);
  
    const delayDebounceFn = setTimeout(() => {
      const fetchUsers = async () => {
        try {
          const url = user.companyId !== 1 ? "/users" : "/users/all";

          const params = {
            name: searchParam,
            companyId: user.companyId !== 1 ? user.companyId : selectedCompanyId || null,
          };
  
          const { data } = await api.get(url, { params });

          if (user.companyId !== 1) {
            if (Array.isArray(data.users)) {
              dispatch({ type: "LOAD_USERS", payload: data.users });
              setHasMore(data.hasMore);
            } else {
              setHasMore(false);
            }
          } else {
            if (Array.isArray(data)) {
              dispatch({ type: "LOAD_USERS", payload: data });
              setHasMore(false);
            } else {
              setHasMore(false);
            }
          }
        } catch (err) {
          toastError(err);
        } finally {
          setLoading(false);
        }
      };
  
      fetchUsers();
    }, 500);
  
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam, selectedCompanyId, user.companyId]); 
  
  useEffect(() => {
    const companyId = localStorage.getItem("companyId");
    const socket = socketManager.getSocket(companyId);

    socket.on(`company-${companyId}-user`, (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_USERS", payload: data.user });
      }

      if (data.action === "delete") {
        dispatch({ type: "DELETE_USER", payload: +data.userId });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [socketManager]);

  const handleSearch = (event) => {
    setSearchParam(event.target.value.toLowerCase());
  };

  const handleOpenUserModal = () => {
    setSelectedUser(null);
    setUserModalOpen(true);
  };

  const handleCloseUserModal = () => {
    setSelectedUser(null);
    setUserModalOpen(false);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setUserModalOpen(true);
  };

  const handleDeleteUser = async (userId) => {
    try {
      await api.delete(`/users/${userId}`);
      toast.success(i18n.t("users.toasts.deleted"));
      dispatch({ type: "DELETE_USER", payload: userId });
    } catch (err) {
      toastError(err);
    }
    setDeletingUser(null);
    setSearchParam("");
  };

  const formatToBrazilTime = (dateString) => {
    const date = new Date(dateString);
    date.setHours(date.getHours() ); 
    
    const formattedDate = date.toLocaleString("pt-BR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  
    return formattedDate;
  };

  const exportToCSV = () => {
    const usersToExport = users.map((user) => ({
      UsuarioID: user.id,
      Nome: user.name,
      Email: user.email,
      Perfil: user.profile,
      Segmento: user.queues.map((queue) => queue.name).join(", ") || "Sem segmento",
      Última_Atualização: formatToBrazilTime(user.updatedAt),
    }));
  
    try {
      const csv = parse(usersToExport);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "Usuários.csv";
      link.click();
    } catch (err) {
      toastError(err);
    }
  };

  return (
    <MainContainer>
      <ConfirmationModal
        title={`${i18n.t("users.confirmationModal.deleteTitle")} ${deletingUser?.name}?`}
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

      <MainHeader>
        <Title>{i18n.t("users.title")}</Title>
        <MainHeaderButtonsWrapper>
          <TextField
            placeholder={i18n.t("contacts.searchPlaceholder")}
            type="search"
            value={searchParam}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon style={{ color: "gray" }} />
                </InputAdornment>
              ),
            }}
          />

          {/* Exibir o Select de empresas somente se o companyId for 1 */}
          {user.companyId === 1 && (
            <FormControl style={{ marginLeft: "16px" }}>
              <Select
                labelId="select-company-label"
                value={selectedCompanyId}
                onChange={(e) => setSelectedCompanyId(e.target.value)}
                native
              >
                <option value="">Selecionar Carteira</option>
                {Array.isArray(companies) && companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </Select>
            </FormControl>
          )}

          <Button
            variant="contained"
            color="primary"
            onClick={handleOpenUserModal}
            style={{ fontWeight: "bold" }}
          >
            {i18n.t("users.buttons.add")}
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={exportToCSV}
            style={{ fontWeight: "bold", marginLeft: "10px" }}
          >
            {i18n.t("Exportar Informações de Usuários")}
          </Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>

      <Paper className={classes.mainPaper} variant="outlined" style={{ borderRadius: "15px" }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell align="center">{i18n.t("users.table.id")}</TableCell>
              <TableCell align="center">{i18n.t("users.table.name")}</TableCell>
              <TableCell align="center">{i18n.t("users.table.email")}</TableCell>
              <TableCell align="center">{i18n.t("Segmentos")}</TableCell>
              <TableCell align="center">{i18n.t("Última atualização")}</TableCell>
              <TableCell align="center">{i18n.t("users.table.profile")}</TableCell>
              <TableCell align="center">{i18n.t("users.table.actions")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell align="center">{user.id}</TableCell>
                <TableCell align="center">{user.name}</TableCell>
                <TableCell align="center">{user.email}</TableCell>
                <TableCell align="center">
                    {user.queues.length > 0 ? (
                      user.queues.map((queue) => (
                        <div
                          key={queue.id}
                          style={{
                            backgroundColor: queue.color,
                            color: "#fff",
                            padding: "4px",
                            margin: "2px",
                            borderRadius: "4px",
                            display: "inline-block",
                          }}
                        >
                          {queue.name}
                        </div>
                      ))
                    ) : (
                      <span>{i18n.t("Não há segmentos")}</span>
                    )}
                  </TableCell>
                  <TableCell align="center">{formatToBrazilTime(user.updatedAt)}</TableCell>
                <TableCell align="center">{user.profile}</TableCell>
                <TableCell align="center">
                  <IconButton size="small" onClick={() => handleEditUser(user)}>
                    <EditIcon />
                  </IconButton>
                  {/*<IconButton
                    size="small"
                    onClick={() => {
                      setConfirmModalOpen(true);
                      setDeletingUser(user);
                    }}
                  >
                    <DeleteOutlineIcon />
                  </IconButton>*/}
                </TableCell>
              </TableRow>
            ))}
            {loading && <TableRowSkeleton columns={4} />}
          </TableBody>
        </Table>
      </Paper>
    </MainContainer>
  );
};

export default Users;
