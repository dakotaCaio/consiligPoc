import React, { useEffect, useState } from "react";
import { Dialog, DialogActions, Button, Checkbox, FormControlLabel } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { IoCheckboxOutline, IoClose, IoCheckbox } from "react-icons/io5";
import { FaSliders } from "react-icons/fa6";
import { PiUserListLight } from "react-icons/pi";
import { TiContacts } from "react-icons/ti";
import { listCompanies } from "../../services/company";
import { listWhatsApps } from "../../services/whatsapp";

const useStyles = makeStyles(() => ({
  paper: {
    backgroundColor: "white",
    width: "537px",
    height: "596px",
    display: "flex",
    borderRadius: "15px",
    flexDirection: "column",
    position: "relative",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px",
    width: "100%",
  },
  filterButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "inherit",
    textTransform: "none",
  },
  title: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "20px"
  },
  cardContainer: {
    display: "flex",
    justifyContent: "center",
    padding: "8px",
    gap: "3rem",
    borderBottom: "1px solid #ccc",
    alignItems: "center",
  },
  cardContainerButton: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "transparent",
    color: "#333",
    textTransform: "none",
    gap: "8px",
    "&:hover": {
      backgroundColor: "transparent",
    },
    "&:focus": {
      outline: "none",
    },
  },
  selected: {
    color: "#00b6d3",
    backgroundColor: "transparent",
  },
  selectedItems: {
    color: "#00b6d3",
    backgroundColor: "rgba(0, 182, 211, 0.5)",
    border: "2px solid rgba(17, 17, 17, 0.5)",
    color: "black",

    "&:hover": {
      backgroundColor: "rgba(0, 182, 211, 0.5)",
      border: "2px solid rgba(17, 17, 17, 0.5)",
    },
    "&:focus": {
      outline: "none",
    },
  },
  cardItems: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
    marginTop: "16px",
    width: "95%",
    margin: "auto",
  },
  pagination: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: "16px",
    gap: "8px",
    fontSize: "14px",
    color: "rgba(0, 0, 0, 0.7)",
  },
  button: {
    fontSize: "14px",
    padding: "8px 16px",
    borderRadius: "30px",
  },
  actions: {
    bottom: "16px",
    display: "flex",
    justifyContent: "space-between",
    width: "100%",
    padding: "16px",
    borderTop: "1px solid #ccc",
  },
  actionsButton: {
    display: "flex",
    justifyContent: "space-between",
    width: "100%",
  },
  buttonFunc: {
    padding: "6px 2rem 6px",
    borderRadius: "30px",
    fontSize: "14px",
    color: "black",
    "&:hover": {
      backgroundColor: "#000000",
      color: "white",
    }
  },
  divButton: {
    display: "flex",
    gap: "4px",
    alignItems: "center",
  },
  selectAllContainer: {
    display: "flex",
    alignItems: "center",
    width: "95%",
    marginLeft: "8px",
  },
  checkbox: {
    color: "#D32929",
    borderRadius: "30px"
  },
  label: {
    fontSize: "12px",
    color: "#333",
    fontWeight: "normal",
  },
}));

const FilterModal = ({ open, onClose, onApply }) => {
  const classes = useStyles();
  const [selected, setSelected] = useState("wallet");
  const [currentPage, setCurrentPage] = useState(1);
  const [companies, setCompanies] = useState([]);
  const [filteredConnections, setFilteredConnections] = useState([]);
  const [filteredOperators, setFilteredOperators] = useState([]);
  const [selectedItems, setSelectedItems] = useState({
    wallet: [],
    connections: [],
    operators: [],
  });

  const itemsPerPage = 8;

  useEffect(() => {
    const fetchCompanies = async () => {
      const data = await listCompanies(); // Busca as empresas
      setCompanies(data);
    };
    fetchCompanies();
  }, []);

  const totalPages = Math.ceil(
    (selected === "connections"
      ? filteredConnections.length
      : selected === "operators"
        ? filteredOperators.length
        : companies.length) / itemsPerPage
  );

  const handleCardClick = (card) => {
    setSelected(card);
    setCurrentPage(1);
  };

  const visibleItems = (
    selected === "connections"
      ? filteredConnections
      : selected === "operators"
        ? filteredOperators
        : companies
  ).slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleItemSelect = (item, section) => {
    const itemIdentifier = section === "operators" || section === "connections" ? item.name : item;
    const newSelection = selectedItems[section].includes(itemIdentifier)
      ? selectedItems[section].filter((selectedItem) => selectedItem !== itemIdentifier)
      : [...selectedItems[section], itemIdentifier];
    setSelectedItems({
      ...selectedItems,
      [section]: newSelection,
    });
    if (section === "operators" || section === "connections") {
      console.log(`Informações de ${section} selecionado(a):`, item);
    }
  };

  const handlePageChange = (direction) => {
    setCurrentPage((prev) => Math.max(1, Math.min(prev + direction, totalPages)));
  };

  const isApplyButtonDisabled = () => {
    return (
      selectedItems.wallet.length === 0 &&
      selectedItems.connections.length === 0 &&
      selectedItems.operators.length === 0
    );
  };

  const handleApplyFilters = () => {
    const filteredCompanies = companies.filter((company) =>
      selectedItems.wallet.includes(company.name)
    );

    const filteredConnectionsData = [];
    const filteredOperatorsData = [];

    selectedItems.wallet.forEach((walletName) => {
      const selectedCompany = companies.find((company) => company.name === walletName);
      if (selectedCompany) {
        filteredConnectionsData.push(...selectedCompany.whatsapps);
        filteredOperatorsData.push(...selectedCompany.users);
      }
    });

    const finalFilteredConnections = filteredConnectionsData.filter((connection) =>
      selectedItems.connections.includes(connection.name)
    );
    const finalFilteredOperators = filteredOperatorsData.filter((operator) =>
      selectedItems.operators.includes(operator.name)
    );

    console.log("Empresas selecionadas:", filteredCompanies);
    console.log("Conexões selecionadas:", finalFilteredConnections);
    console.log("Operadores selecionados:", finalFilteredOperators);

    onApply({
      companies: filteredCompanies,
      whatsAppSessions: finalFilteredConnections,
      users: finalFilteredOperators,
    });
  };

  const handleSelectAll = (section) => {
    const allItems =
      selected === "connections"
        ? filteredConnections
        : selected === "operators"
          ? filteredOperators
          : companies;
    const selectedNames = allItems.map(item =>
      section === "connections" || section === "operators"
        ? item.name
        : item.name
    );
    const isAllSelected = selectedNames.every(name => selectedItems[section].includes(name));
    if (isAllSelected) {
      setSelectedItems({
        ...selectedItems,
        [section]: [],
      });
    } else {
      setSelectedItems({
        ...selectedItems,
        [section]: selectedNames,
      });
    }
  };

  const handleReset = () => {
    setSelected("wallet");
    setSelectedItems({
      wallet: [],
      connections: [],
      operators: [],
    });
    setCurrentPage(1);
    setFilteredConnections([]); // Limpa as conexões
    setFilteredOperators([]); // Limpa os operadores
  };

  const filterConnectionsAndOperators = () => {
    const filteredConnectionsData = [];
    const filteredOperatorsData = [];

    selectedItems.wallet.forEach((walletName) => {
      const selectedCompany = companies.find((company) => company.name === walletName);
      if (selectedCompany) {
        filteredConnectionsData.push(...selectedCompany.whatsapps);
        filteredOperatorsData.push(...selectedCompany.users);
      }
    });

    setFilteredConnections(filteredConnectionsData);
    setFilteredOperators(filteredOperatorsData);
  };

  useEffect(() => {
    if (!open) {
      handleReset();
    }
  }, [open]);

  useEffect(() => {
    if (selectedItems.wallet.length > 0 && selected !== "wallet") {
      filterConnectionsAndOperators();
    }
  }, [selectedItems.wallet, selected]); // Filtra quando as carteiras mudam ou a seção

  // Função para determinar a cor do status
  const getStatusColor = (status) => {
    switch (status) {
      case "DISCONNECTED":
        return "red";
      case "CONNECTED":
        return "green";
      case "QRCODE":
        return "yellow";
      default:
        return "black";
    }
  };

  return (
    <Dialog open={open} onClose={onClose} aria-labelledby="filter-modal-title" classes={{ paper: classes.paper }}>
      <div className={classes.header}>
        <div className={classes.title}>
          <FaSliders size={25} />
          <span>Filtro</span>
        </div>
        <IoClose onClick={onClose} size={20} />
      </div>

      <div className={classes.cardContainer}>
        <Button
          className={`${classes.cardContainerButton} ${selected === "wallet" ? classes.selected : ""}`}
          onClick={() => handleCardClick("wallet")}
        >
          <div className={classes.divButton}>
            <PiUserListLight size={20} />
            Carteira
          </div>
        </Button>
        <Button
          className={`${classes.cardContainerButton} ${selected === "connections" ? classes.selected : ""}`}
          onClick={() => handleCardClick("connections")}
        >
          <div className={classes.divButton}>
            <TiContacts size={20} />
            Conexões
          </div>
        </Button>
        <Button
          className={`${classes.cardContainerButton} ${selected === "operators" ? classes.selected : ""}`}
          onClick={() => handleCardClick("operators")}
        >
          <div className={classes.divButton}>
            <TiContacts size={20} />
            Operadores
          </div>
        </Button>
      </div>

      <div className={classes.cardItems}>
        {selected === "wallet" && (
          <>
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectedItems.wallet.length === companies.length}
                  onChange={() => handleSelectAll("wallet")}
                  size="small"
                />
              }
              label="Selecionar todos"
              className={classes.selectAllLabel}
            />
            {companies.map((item, index) => (
              <Button
                key={index}
                className={`${classes.button} ${selectedItems.wallet.includes(item.name) ? classes.selectedItems : ""}`}
                variant="outlined"
                onClick={() => handleItemSelect(item.name, "wallet")}
              >
                {item.name}
              </Button>
            ))}
          </>
        )}
        {selected === "connections" && (
          <>
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectedItems.connections.length === filteredConnections.length}
                  onChange={() => handleSelectAll("connections")}
                  size="small"
                />
              }
              label="Selecionar todos"
              className={classes.selectAllLabel}
            />
            {visibleItems.map((item, index) => (
              <Button
                key={index}
                className={`${classes.button} ${selectedItems.connections.includes(item.name) ? classes.selectedItems : ""}`}
                variant="outlined"
                onClick={() => handleItemSelect(item, "connections")}
              >
                <div className={classes.connectionItem}>
                  <span>{item.name}</span>
                  <span
                    style={{
                      color: getStatusColor(item.status),
                      fontSize: "12px", // Tamanho menor
                      marginLeft: "8px", // Espaçamento entre o nome e o status
                    }}
                  >
                    {item.status}
                  </span>
                </div>
              </Button>
            ))}
          </>
        )}
        {selected === "operators" && (
          <>
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectedItems.operators.length === filteredOperators.length}
                  onChange={() => handleSelectAll("operators")}
                  size="small"
                />
              }
              label="Selecionar todos"
              className={classes.selectAllLabel}
            />
            {visibleItems.map((item, index) => (
              <Button
                key={index}
                className={`${classes.button} ${selectedItems.operators.includes(item.name) ? classes.selectedItems : ""}`}
                variant="outlined"
                onClick={() => handleItemSelect(item, "operators")}
              >
                {item.name}
              </Button>
            ))}
          </>
        )}
      </div>

      <div className={classes.pagination}>
        <Button variant="text" disabled={currentPage === 1} onClick={() => handlePageChange(-1)}>Anterior</Button>
        <span>Página {currentPage} de {totalPages}</span>
        <Button variant="text" disabled={currentPage === totalPages} onClick={() => handlePageChange(1)}>Próxima</Button>
      </div>

      <div className={classes.actions}>
        <div>
          <Button className={classes.buttonFunc} color="default" variant="outlined" onClick={handleReset}>Resetar</Button>
        </div>
        <div>
          <Button className={classes.buttonFunc} onClick={handleApplyFilters} variant="outlined" disabled={isApplyButtonDisabled()}>Aplicar</Button>
        </div>
      </div>
    </Dialog>
  );
};

export default FilterModal;






