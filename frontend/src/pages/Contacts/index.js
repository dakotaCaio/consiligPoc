import React, { useState, useEffect, useContext } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { TextField, InputAdornment, Button, Paper, Table, TableBody, TableCell, TableRow, Avatar, IconButton, CircularProgress } from "@material-ui/core";
import { Search as SearchIcon, WhatsApp as WhatsAppIcon, DeleteOutline as DeleteOutlineIcon, Edit as EditIcon } from "@material-ui/icons";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import MainContainer from "../../components/MainContainer";
import ContactModal from "../../components/ContactModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import { AuthContext } from "../../context/Auth/AuthContext";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

const useStyles = makeStyles((theme) => ({
  pagination: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginTop: "2rem",
    gap: "1rem",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
}));

const Contacts = () => {
  const classes = useStyles();
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [contacts, setContacts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchNumber, setSearchNumber] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const [contactTicket, setContactTicket] = useState(null);
  const [newTicketModalOpen, setNewTicketModalOpen] = useState(false);
  const [selectedContactId, setSelectedContactId] = useState(null);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletingContact, setDeletingContact] = useState(null);
  const itemsPerPage = 10;
  const { profile } = user;

  useEffect(() => {
    const fetchContacts = async () => {
      setLoading(true);
      try {
        const url = user.companyId !== 1 ? "/contacts" : "/contacts/list";
        const { data } = await api.get(url, {
          params: {
            page: pageNumber,
            limit: itemsPerPage,
            name: searchTerm || undefined,
            number: searchNumber || undefined,
          },
        });
        setContacts(data.contacts);
        setTotalPages(Math.ceil(data.totalContacts / itemsPerPage));
      } catch (err) {
        toastError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, [pageNumber, searchTerm, searchNumber, user.companyId]);

  const handleSearch = (e) => {
    const isNumber = /^[0-9]+$/.test(e.target.value);

    if(!isNumber){
      setSearchTerm(e.target.value);
      setPageNumber(1);
    }
    else{
      setSearchNumber(e.target.value);
      setPageNumber(1)
    }
    
  };

  const handleEditContact = (contactId) => {
    setSelectedContactId(contactId);
    setContactModalOpen(true);
  };

  const handleDeleteContact = async () => {
    if (!deletingContact) return; 
    try {
      await api.delete(`/contacts/${deletingContact.id}`);
      setContacts((prev) => prev.filter((contact) => contact.id !== deletingContact.id));
      toast.success(i18n.t("contacts.toasts.deleted"));
    } catch (err) {
      toastError(err);
    } finally {
      setDeletingContact(null);
      setConfirmOpen(false); // Fecha o modal de confirmação
    }
  };
  
  const handleDeleteButtonClick = (contact) => {
    setDeletingContact(contact);
    setConfirmOpen(true); // Abre o modal de confirmação
  };

  const handlePageChange = (direction) => {
    setPageNumber((prevPageNumber) => {
      const newPageNumber = prevPageNumber + direction;
      if (newPageNumber >= 1 && newPageNumber <= totalPages) {
        return newPageNumber;
      }
      return prevPageNumber;
    });
  };

  return (
    <MainContainer>
      <ContactModal
        open={contactModalOpen}
        contactId={selectedContactId}
        onClose={() => setContactModalOpen(false)}
      />
      <ConfirmationModal
        open={confirmOpen}
        title={i18n.t("contacts.confirmationModal.deleteTitle")}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDeleteContact}
      >
        {i18n.t("contacts.confirmationModal.deleteMessage")}
      </ConfirmationModal>
      <MainHeader>
        <Title>{i18n.t("contacts.title")}</Title>
        <MainHeaderButtonsWrapper>
          <TextField
            placeholder={i18n.t("contacts.searchPlaceholder")}
            type="search"
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon style={{ color: "gray" }} />
                </InputAdornment>
              ),
            }}
          />
        </MainHeaderButtonsWrapper>
      </MainHeader>

      <Paper variant="outlined" style={{ borderRadius: "15px", position: "relative" }}>
        {/* Overlay de loading */}
        {loading && (
          <div className={classes.loadingOverlay}>
            <CircularProgress />
          </div>
        )}

        <Table size="small">
          <TableBody>
            {contacts.map((contact) => (
              <TableRow key={contact.id}>
                <TableCell style={{ paddingRight: 0 }}>
                  <Avatar src={contact.profilePicUrl} />
                </TableCell>
                <TableCell>{contact.name}</TableCell>
                <TableCell align="center">{contact.number}</TableCell>
                <TableCell align="center">{contact.email}</TableCell>
                <TableCell align="center">
                  {/* WhatsApp Icon com link para o ticket */}
                  {contact.tickets.length > 0 && (
                    <IconButton
                      size="small"
                      component={Link}
                      to={`/tickets/${contact.tickets[0]?.uuid}`}
                    >
                      <WhatsAppIcon />
                    </IconButton>
                  )}
                  <IconButton size="small" onClick={() => handleEditContact(contact.id)}>
                    <EditIcon />
                  </IconButton>
                  {profile === "admin" && (
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteButtonClick(contact)}
                    >
                      <DeleteOutlineIcon />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {loading && <TableRowSkeleton avatar columns={3} />}
          </TableBody>
        </Table>
      </Paper>

      <div className={classes.pagination}>
        <Button
          variant="outlined"
          disabled={pageNumber === 1}
          onClick={() => handlePageChange(-1)}
        >
          Anterior
        </Button>
        <span>
          Página {pageNumber} de {totalPages}
        </span>
        <Button
          variant="outlined"
          disabled={pageNumber === totalPages}
          onClick={() => handlePageChange(1)}
        >
          Próxima
        </Button>
      </div>
    </MainContainer>
  );
};

export default Contacts;
