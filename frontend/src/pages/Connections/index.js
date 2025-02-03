import React, { useState, useCallback, useContext, useEffect } from "react";
import { toast } from "react-toastify";
import { format, parseISO } from "date-fns";

import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import {
	Button,
	TableBody,
	TableRow,
	TableCell,
	IconButton,
	Table,
	TableHead,
	Paper,
	Tooltip,
	Typography,
	CircularProgress,
	FormControl,
	Select,
  TextField
} from "@material-ui/core";
import {
	Edit,
	CheckCircle,
	SignalCellularConnectedNoInternet2Bar,
	SignalCellularConnectedNoInternet0Bar,
	SignalCellular4Bar,
	CropFree,
	DeleteOutline,
} from "@material-ui/icons"; 

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import TableRowSkeleton from "../../components/TableRowSkeleton";

import api from "../../services/api";
import WhatsAppModal from "../../components/WhatsAppModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import QrcodeModal from "../../components/QrcodeModal";
import { i18n } from "../../translate/i18n";
import { WhatsAppsContext } from "../../context/WhatsApp/WhatsAppsContext";
import toastError from "../../errors/toastError";

import { AuthContext } from "../../context/Auth/AuthContext";
import { Can } from "../../components/Can";

const useStyles = makeStyles(theme => ({
	mainPaper: {
		flex: 1,
		padding: theme.spacing(1),
		overflowY: "scroll",
		...theme.scrollbarStyles,
	},
	customTableCell: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
	},
	tooltip: {
		backgroundColor: "#f5f5f9",
		color: "rgba(0, 0, 0, 0.87)",
		fontSize: theme.typography.pxToRem(14),
		border: "1px solid #dadde9",
		maxWidth: 450,
	},
	tooltipPopper: {
		textAlign: "center",
	},
	buttonProgress: {
		color: green[500],
	},
}));

const CustomToolTip = ({ title, content, children }) => {
	const classes = useStyles();

	return (
		<Tooltip
			arrow
			classes={{
				tooltip: classes.tooltip,
				popper: classes.tooltipPopper,
			}}
			title={
				<React.Fragment>
					<Typography gutterBottom color="inherit">
						{title}
					</Typography>
					{content && <Typography>{content}</Typography>}
				</React.Fragment>
			}
		>
			{children}
		</Tooltip>
	);
};

const Connections = () => {
  const classes = useStyles();
  const { whatsApps, loading } = useContext(WhatsAppsContext);
  const [whatsAppModalOpen, setWhatsAppModalOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedWhatsApp, setSelectedWhatsApp] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [devices, setDevices] = useState([]);
  const confirmationModalInitialState = {
    action: "",
    title: "",
    message: "",
    whatsAppId: "",
    open: false,
  };
  const [confirmModalInfo, setConfirmModalInfo] = useState(confirmationModalInitialState);
  const { user } = useContext(AuthContext);
  const [companies, setCompanies] = useState([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

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

	const filteredWhatsAppss = whatsApps?.filter((whatsApp) => {
		if (!selectedCompanyId) {
			return true;
		}
		return whatsApp.companyId === parseInt(selectedCompanyId, 10); 
	});

  const handleStartWhatsAppSession = async (whatsAppId) => {
    try {
      await api.post(`/whatsappsession/${whatsAppId}`);
    } catch (err) {
      toastError(err);
    }
  };

  const handleRequestNewQrCode = async (whatsAppId) => {
    try {
      await api.put(`/whatsappsession/${whatsAppId}`);
    } catch (err) {
      toastError(err);
    }
  };

  useEffect(() => {
    const fetchWhatsAppDevices = async () => {
        try {
            const { data } = await api.get("/whatsapp");
            setDevices(data);
        } catch (err) {
            toastError(err);
        }
    };

    fetchWhatsAppDevices();
  }, []);

  const handleOpenWhatsAppModal = () => {
    setSelectedWhatsApp(null);
    setWhatsAppModalOpen(true);
  };

  const handleCloseWhatsAppModal = useCallback(() => {
		setWhatsAppModalOpen(false);
		setSelectedWhatsApp(null);
	}, [setSelectedWhatsApp, setWhatsAppModalOpen]);

  const handleOpenQrModal = (whatsApp) => {
    setSelectedWhatsApp(whatsApp);
    setQrModalOpen(true);
  };

  const handleCloseQrModal = useCallback(() => {
    setSelectedWhatsApp(null);
    setQrModalOpen(false);
  }, []);

  const handleEditWhatsApp = (whatsApp) => {
    if (!user) {
      toast.error(i18n.t("auth.toasts.notAuthenticated"));
      return;
    }

    if (user.companyId !== 1 && user.companyId !== whatsApp.companyId) {
      toast.error(i18n.t("whatsappModal.noPermission"));
      return;
    }

    setSelectedWhatsApp(whatsApp);
    setWhatsAppModalOpen(true);
  };

  const handleOpenConfirmationModal = (action, whatsAppId) => {
    if (action === "disconnect") {
      setConfirmModalInfo({
        action: action,
        title: i18n.t("connections.confirmationModal.disconnectTitle"),
        message: i18n.t("connections.confirmationModal.disconnectMessage"),
        whatsAppId: whatsAppId,
      });
    }

    if (action === "delete") {
      setConfirmModalInfo({
        action: action,
        title: i18n.t("connections.confirmationModal.deleteTitle"),
        message: i18n.t("connections.confirmationModal.deleteMessage"),
        whatsAppId: whatsAppId,
      });
    }
    setConfirmModalOpen(true);
  };

  const handleSubmitConfirmationModal = async () => {
    if (confirmModalInfo.action === "disconnect") {
      try {
        await api.delete(`/whatsappsession/${confirmModalInfo.whatsAppId}`);
      } catch (err) {
        toastError(err);
      }
    }

    if (confirmModalInfo.action === "delete") {
      try {
        await api.delete(`/whatsapp/${confirmModalInfo.whatsAppId}`);
        toast.success(i18n.t("connections.toasts.deleted"));
      } catch (err) {
        toastError(err);
      }
    }

    setConfirmModalInfo(confirmationModalInitialState);
  };

  const fetchNumber = (session) => {
		try {
			const jsonSession = JSON.parse(session);
			const jsonNumber = jsonSession.creds.me.id;
			return jsonNumber;

		} catch (error) {
			return ""
		}
	}
  const handleSessionNumber = (whatsApp) => {
    // Se a conexão está conectada, exibe o número diretamente
    if (whatsApp.status === "CONNECTED" && whatsApp.number) {
      return whatsApp.number; 
    } 
  
    // Se desconectado, retorna "Desconectado"
    return "Desconectado"; 
  };
  
  const renderActionButtons = (whatsApp) => {
    return (
      <>
        {whatsApp.status === "qrcode" && (
          <Button
            size="small"
            variant="contained"
            color="primary"
            onClick={() => handleOpenQrModal(whatsApp)}
          >
            {i18n.t("connections.buttons.qrcode")}
          </Button>
        )}
        {whatsApp.status === "DISCONNECTED" && (
          <>
            <Button
              size="small"
              variant="outlined"
              color="primary"
              onClick={() => handleStartWhatsAppSession(whatsApp.id)}
            >
              {i18n.t("connections.buttons.tryAgain")}
            </Button>{" "}
            <Button
              size="small"
              variant="outlined"
              color="secondary"
              onClick={() => handleRequestNewQrCode(whatsApp.id)}
            >
              {i18n.t("connections.buttons.newQr")}
            </Button>
          </>
        )}
        {(whatsApp.status === "CONNECTED" ||
          whatsApp.status === "PAIRING" ||
          whatsApp.status === "TIMEOUT") && (
          <Button
            size="small"
            variant="outlined"
            color="secondary"
            onClick={() => {
              handleOpenConfirmationModal("disconnect", whatsApp.id);
            }}
          >
            {i18n.t("connections.buttons.disconnect")}
          </Button>
        )}
        {whatsApp.status === "OPENING" && (
          <Button size="small" variant="outlined" disabled color="default">
            {i18n.t("connections.buttons.connecting")}
          </Button>
        )}
      </>
    );
  };

  const renderStatusToolTips = (whatsApp) => {
    return (
      <div className={classes.customTableCell}>
        {whatsApp.status === "DISCONNECTED" && (
          <CustomToolTip
            title={i18n.t("connections.toolTips.disconnected.title")}
            content={i18n.t("connections.toolTips.disconnected.content")}
          >
            <SignalCellularConnectedNoInternet0Bar color="secondary" />
          </CustomToolTip>
        )}
        {whatsApp.status === "OPENING" && (
          <CircularProgress size={24} className={classes.buttonProgress} />
        )}
        {whatsApp.status === "qrcode" && (
          <CustomToolTip
            title={i18n.t("connections.toolTips.qrcode.title")}
            content={i18n.t("connections.toolTips.qrcode.content")}
          >
            <CropFree />
          </CustomToolTip>
        )}
        {whatsApp.status === "CONNECTED" && (
          <CustomToolTip title={i18n.t("connections.toolTips.connected.title")}>
            <SignalCellular4Bar style={{ color: green[500] }} />
          </CustomToolTip>
        )}
        {(whatsApp.status === "TIMEOUT" || whatsApp.status === "PAIRING") && (
          <CustomToolTip
            title={i18n.t("connections.toolTips.timeout.title")}
            content={i18n.t("connections.toolTips.timeout.content")}
          >
            <SignalCellularConnectedNoInternet2Bar color="secondary" />
          </CustomToolTip>
        )}
      </div>
    );
  };

  const handleSearchChange = event => {
		setSearchTerm(event.target.value);
	};

	const filteredWhatsApps = whatsApps?.filter((whatsApp) => {
		const matchesDeviceName = whatsApp.name.toLowerCase().includes(searchTerm.toLowerCase());
		const matchesQueueName = whatsApp.queues.some((queue) =>
			queue.name.toLowerCase().includes(searchTerm.toLowerCase())
		);
		return matchesDeviceName || matchesQueueName;
	});

  return (
    <MainContainer>
      <ConfirmationModal
        title={confirmModalInfo.title}
        open={confirmModalOpen}
        onClose={setConfirmModalOpen}
        onConfirm={handleSubmitConfirmationModal}
      >
        {confirmModalInfo.message}
      </ConfirmationModal>

      <QrcodeModal
        open={qrModalOpen}
        onClose={handleCloseQrModal}
        whatsAppId={!whatsAppModalOpen && selectedWhatsApp?.id}
      />

      <WhatsAppModal
        open={whatsAppModalOpen}
        onClose={handleCloseWhatsAppModal}
        whatsAppId={!qrModalOpen && selectedWhatsApp?.id}
      />

      <MainHeader>
        <Title>{i18n.t("connections.title")}</Title>
        <MainHeaderButtonsWrapper>
          {user.companyId === 1 && (
            <FormControl style={{ marginLeft: "16px" }}>
              <Select
                labelId="select-company-label"
                value={selectedCompanyId}
                onChange={(e) => setSelectedCompanyId(e.target.value)}
                native
              >
                <option value="">Selecionar Carteira</option>
                {Array.isArray(companies) &&
                  companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
              </Select>
            </FormControl>
          )}

          <Can
            role={user.profile}
            perform="connections-page:addConnection"
            yes={() => (
              <Button
                variant="contained"
                color="primary"
                onClick={handleOpenWhatsAppModal}
                style={{ fontWeight: "bold" }}
              >
                {i18n.t("connections.buttons.add")}
              </Button>
            )}
          />
        </MainHeaderButtonsWrapper>
      </MainHeader>

      <Paper className={classes.mainPaper} variant="outlined" style={{ borderRadius: "15px" }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell align="center">{i18n.t("connections.table.name")}</TableCell>
              <TableCell align="center">{i18n.t("connections.table.status")}</TableCell>
              <TableCell align="center">{i18n.t("Número")}</TableCell>
              <TableCell align="center">{i18n.t("Segmentos")}</TableCell>
                <Can
                  role={user.profile}
                  perform="connections-page:actionButtons"
                  yes={() => (
                    <TableCell align="center">{i18n.t("connections.table.session")}</TableCell>
                  )}
                />
              <TableCell align="center">{i18n.t("connections.table.lastUpdate")}</TableCell>
              <TableCell align="center">{i18n.t("connections.table.default")}</TableCell>
              <Can
                role={user.profile}
                perform="connections-page:editOrDeleteConnection"
                yes={() => (
                  <TableCell align="center">{i18n.t("connections.table.actions")}</TableCell>
                )}
              />
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRowSkeleton />
            ) : (
              <>
                {filteredWhatsApps?.length > 0 ? (
                  filteredWhatsApps.map((whatsApp) => (
                    <TableRow key={whatsApp.id}>
                      <TableCell align="center">{whatsApp.name}</TableCell>
                      <TableCell align="center">{renderStatusToolTips(whatsApp)}</TableCell>
                      <TableCell align="center">{handleSessionNumber(whatsApp)}</TableCell>
                        <TableCell align="center">
                        {whatsApp.queues.length > 0 ? (
                          whatsApp.queues.map((queue) => (
                            <div key={queue.id} style={{ backgroundColor: queue.color, padding: "4px", margin: "2px", borderRadius: "4px" }}>
                              {queue.name}
                            </div>
                          ))
                        ) : (
                          <span>{i18n.t("Não há segmentos")}</span>
                        )}
                      </TableCell>
                      <Can
                        role={user.profile}
                        perform="connections-page:actionButtons"
                        yes={() => (
                          <TableCell align="center">{renderActionButtons(whatsApp)}</TableCell>
                        )}
                      />
                      <TableCell align="center">
                        {format(parseISO(whatsApp.updatedAt), "dd/MM/yy HH:mm")}
                      </TableCell>
                      <TableCell align="center">
                        {whatsApp.isDefault && (
                          <div className={classes.customTableCell}>
                            <CheckCircle style={{ color: green[500] }} />
                          </div>
                        )}
                      </TableCell>
                      <Can
                        role={user.profile}
                        perform="connections-page:editOrDeleteConnection"
                        yes={() => (
                          <TableCell align="center">
                            <IconButton
                              style={{ fontWeight: "bold" }}
                              size="small"
                              onClick={() => handleEditWhatsApp(whatsApp)}
                            >
                              <Edit />
                            </IconButton>
                            <IconButton
                              style={{ fontWeight: "bold" }}
                              size="small"
                              onClick={() => {
                                handleOpenConfirmationModal("delete", whatsApp.id);
                              }}
                            >
                              <DeleteOutline />
                            </IconButton>
                          </TableCell>
                        )}
                      />
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      {i18n.t("Sem conexões")}
                    </TableCell>
                  </TableRow>
                )}
              </>
            )}
          </TableBody>
        </Table>
      </Paper>
    </MainContainer>
  );
};


export default Connections;
