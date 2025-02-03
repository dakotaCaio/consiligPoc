import React, { useContext, useEffect, useReducer, useState } from "react";
import { Link as RouterLink, useHistory } from "react-router-dom";

import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import ListSubheader from "@material-ui/core/ListSubheader";
import Divider from "@material-ui/core/Divider";
import { Backdrop, Badge, Box, Button, CircularProgress, Collapse, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, List, TextField } from "@material-ui/core";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import PeopleIcon from "@material-ui/icons/People";
import AnnouncementIcon from "@material-ui/icons/Announcement";
import { IoMdSettings } from "react-icons/io";
import { MdPlaylistAddCheckCircle, MdSendAndArchive } from "react-icons/md";
import { MdOutlinePhonelink } from "react-icons/md";
import { RxDashboard } from "react-icons/rx";
import { FaWhatsapp } from "react-icons/fa";
import { MdOutlineQuickreply } from "react-icons/md";
import { FaRegCalendarCheck } from "react-icons/fa";
import { LuTags } from "react-icons/lu";
import { GoPaperAirplane } from "react-icons/go";
import { SlDocs } from "react-icons/sl";
import { FaTasks } from "react-icons/fa";
import { HiOutlineUserGroup } from "react-icons/hi2";
import { IoSettingsOutline } from "react-icons/io5";
import { RiContactsLine, RiFileHistoryLine } from "react-icons/ri";

import { i18n } from "../translate/i18n";
import { WhatsAppsContext } from "../context/WhatsApp/WhatsAppsContext";
import { AuthContext } from "../context/Auth/AuthContext";
import { Can } from "../components/Can";
import { SocketContext } from "../context/Socket/SocketContext";
import { isArray } from "lodash";
import api from "../services/api";
import toastError from "../errors/toastError";
import { makeStyles } from "@material-ui/core/styles";
import usePlans from "../hooks/usePlans";
import Typography from "@material-ui/core/Typography";
import useVersion from "../hooks/useVersion";
import { HiOutlineDocumentReport } from "react-icons/hi";
import jsPDF from "jspdf";
import moment from "moment";
import { ListItemButton } from "@mui/material";
import { FaFileCsv } from "react-icons/fa6";
import { VscNotebookTemplate } from "react-icons/vsc";
import Templates from "../pages/Templates/Templates";

const useStyles = makeStyles((theme) => ({
  ListSubheader: {
    height: 26,
    marginTop: "-15px",
    marginBottom: "-10px",
  },
}));


function ListItemLink(props) {
  const { icon, primary, to, className } = props;

  const renderLink = React.useMemo(
    () =>
      React.forwardRef((itemProps, ref) => (
        <RouterLink to={to} ref={ref} {...itemProps} />
      )),
    [to]
  );

  return (
    <li>
      <ListItem button dense component={renderLink} className={className}>
        {icon ? <ListItemIcon>{icon}</ListItemIcon> : null}
        <ListItemText primary={primary} style={{ marginLeft: "-12px", fontWeight:"bold"}} />
      </ListItem>
    </li>
  );
}

const reducer = (state, action) => {
  if (action.type === "LOAD_CHATS") {
    const chats = action.payload;
    const newChats = [];

    if (isArray(chats)) {
      chats.forEach((chat) => {
        const chatIndex = state.findIndex((u) => u.id === chat.id);
        if (chatIndex !== -1) {
          state[chatIndex] = chat;
        } else {
          newChats.push(chat);
        }
      });
    }

    return [...state, ...newChats];
  }

  if (action.type === "UPDATE_CHATS") {
    const chat = action.payload;
    const chatIndex = state.findIndex((u) => u.id === chat.id);

    if (chatIndex !== -1) {
      state[chatIndex] = chat;
      return [...state];
    } else {
      return [chat, ...state];
    }
  }

  if (action.type === "DELETE_CHAT") {
    const chatId = action.payload;

    const chatIndex = state.findIndex((u) => u.id === chatId);
    if (chatIndex !== -1) {
      state.splice(chatIndex, 1);
    }
    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }

  if (action.type === "CHANGE_CHAT") {
    const changedChats = state.map((chat) => {
      if (chat.id === action.payload.chat.id) {
        return action.payload.chat;
      }
      return chat;
    });
    return changedChats;
  }
};

const MainListItems = (props) => {
  const classes = useStyles();
  const { drawerClose, collapsed } = props;
  const { whatsApps } = useContext(WhatsAppsContext);
  const { user, handleLogout } = useContext(AuthContext);
  const [connectionWarning, setConnectionWarning] = useState(false);
  const [openCampaignSubmenu, setOpenCampaignSubmenu] = useState(false);
  const [showCampaigns, setShowCampaigns] = useState(false);
  const [showTemplate, setShowTemplate] = useState(false);
  const [showKanban, setShowKanban] = useState(false);
  const [showOpenAi, setShowOpenAi] = useState(false);
  const [showIntegrations, setShowIntegrations] = useState(false);
  const history = useHistory();
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSchedules, setShowSchedules] = useState(false);
  const [showInternalChat, setShowInternalChat] = useState(false);
  const [showExternalApi, setShowExternalApi] = useState(false);
  const [openPopupMessages, setOpenPopupMessages] = useState(false);
  const [invisible, setInvisible] = useState(true);
  const [pageNumber, setPageNumber] = useState(1);
  const [searchParam] = useState("");
  const [chats, dispatch] = useReducer(reducer, []);
  const { getPlanCompany } = usePlans();
  const [version, setVersion] = useState(false);
  const { getVersion } = useVersion();
  const socketManager = useContext(SocketContext);
  const [openCampaignsSubmenu, setOpenCampaignsSubmenu] = useState(false);
  const [openRelatoriesSubmenu, setOpenRelatoriesSubmenu] = useState(false);
  


  const [openHistoryModal, setOpenHistoryModal] = useState(false); // Novo estado para o modal

  const handleHistoryClick = () => {
    console.log("Clicou no item de histórico");
    setOpenHistoryModal(true); // Abre o modal ao clicar no item "Histórico"
  };

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleNavigateToHistory = () => {
    // Perform any necessary actions, like saving state or validation
    history("/history/relatories"); // Redirects to the history page
  };


  const handleOpenPopupMessages = () => setOpenPopupMessages(true);
  const handleClosePopupMessages = () => setOpenPopupMessages(false);

  const formatToBrazilTime = (dateString) => {
		const date = new Date(dateString); 
		date.setHours(date.getHours()); 

		const formattedDate = date.toLocaleString("pt-BR", {
		  timeZone: "America/Sao_Paulo",
		  year: "numeric",
		  month: "2-digit",
		  day: "2-digit",
		  hour: "2-digit",
		  minute: "2-digit",
		  second: "2-digit",
		});
	  
		return formattedDate;
	  };

    const handleGenerateCSV = async () => {
      setLoading(true);
      try {
        const response = await api.get("/tickets/list", {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        });
  
        if (response.status !== 200 || !Array.isArray(response.data.tickets)) {
          throw new Error("Erro ao buscar os tickets");
        }
    
        const tickets = response.data.tickets;
  
        const ticketGroups = {};
    
        tickets.forEach(ticket => {
          const companyName = ticket.company?.name || "Empresa não encontrada";
          const cpnTicketsValue = ticket.cpnTickets ? "true" : "false";
          const cpnTicketsDate = ticket.cpnTickets && ticket.cpnTickets.date
            ? moment(ticket.cpnTickets.date).format("YYYY-MM-DD")
            : "";
    
          if (cpnTicketsValue === "true" && cpnTicketsDate) {
            if (!ticketGroups[companyName]) {
              ticketGroups[companyName] = {};
            }
            if (!ticketGroups[companyName][cpnTicketsDate]) {
              ticketGroups[companyName][cpnTicketsDate] = 0;
            }
            ticketGroups[companyName][cpnTicketsDate]++;
          }
        });
  
        const csvData = [];
        for (const companyName in ticketGroups) {
          for (const date in ticketGroups[companyName]) {
            const count = ticketGroups[companyName][date];
            csvData.push([companyName, count, date]);
          }
        }
  
        const headers = ["Empresa", "Envio", "Data do Envio"];
        const csvContent = [headers, ...csvData].map(e => e.join(";")).join("\n");
    
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "tickets.csv"; 
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link); 
    
      } catch (error) {
        console.error("Erro ao gerar CSV:", error);
      } finally {
        setLoading(false);
      }
    };

  const handleGenerateHistory = () => {
    console.log("Gerar histórico...");
    // Adicione a lógica para gerar o histórico aqui
    setOpenHistoryModal(false); // Fecha o modal após gerar o histórico
  };

  const handleDownloadPDF = async (number) => {
		try {
			console.log("Iniciando download do PDF...");
			const response = await api.get(`/pdf/${number}`);
			console.log("Resposta completa:", response);
			console.log("Dados recebidos:", response.data);
	
			const messages = response.data.messages;
      const users = response.data.responseUsers;
   
      
      if(!users[0]){
        toastError("Não existe um ticket aberto ou fechado para este Número!");
        return;
      }
	
			if (!Array.isArray(messages)) {
				toastError("Os dados de mensagens não estão no formato esperado.");
				return;
			}
	
			if (messages.length === 0) {
				toastError("Nenhuma mensagem encontrada para este número.");
				return;
			}
	
			const doc = new jsPDF();
			doc.setFontSize(12);
			doc.text(`Histórico de Mensagens - Número: ${number} | Atendente: ${users[0].name}`, 10, 10);
			doc.line(10, 15, 200, 15);
	
			let yPosition = 20;
			const lineHeight = 10;
			const pageHeight = 280;
	
			messages.forEach((message, index) => {
				const author = message.contact?.name || users[0].name; 
				const content = message.body || "Sem conteúdo"; 
				const formattedDate = formatToBrazilTime(message.createdAt); 
			  
				const messageText = `${index + 1}. ${author}: ${content} - ${formattedDate}`;
				console.log(`Processando mensagem ${index + 1}:`, messageText);
			  
				const splitText = doc.splitTextToSize(messageText, 180);
			  
				splitText.forEach(line => {
				  if (yPosition + lineHeight > pageHeight) {
					doc.addPage();
					yPosition = 10;
				  }
				  doc.text(line, 10, yPosition);
				  yPosition += lineHeight;
				});
			});

			doc.save(`Histórico de Mensagens do Número:${number}.pdf`);
		} catch (err) {
			console.error("Erro ao gerar o PDF:", err);
			toastError("Erro ao gerar o PDF. Tente novamente.");
		}
	};

  useEffect(() => {
    async function fetchVersion() {
      const _version = await getVersion();
      setVersion(_version.version);
    }
    fetchVersion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
 

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    async function fetchData() {
      const companyId = user.companyId;
      const planConfigs = await getPlanCompany(undefined, companyId);
  
      setShowCampaigns(planConfigs.plan.useCampaigns);
      setShowKanban(planConfigs.plan.useKanban);
      setShowOpenAi(planConfigs.plan.useOpenAi);
      setShowIntegrations(planConfigs.plan.useIntegrations);
      setShowSchedules(planConfigs.plan.useSchedules);
      setShowInternalChat(planConfigs.plan.useInternalChat);
      setShowExternalApi(planConfigs.plan.useExternalApi);
      setShowTemplate(planConfigs.plan.useTemplate); 
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);



  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchChats();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParam, pageNumber]);

  useEffect(() => {
    const companyId = localStorage.getItem("companyId");
    const socket = socketManager.getSocket(companyId);

    socket.on(`company-${companyId}-chat`, (data) => {
      if (data.action === "new-message") {
        dispatch({ type: "CHANGE_CHAT", payload: data });
      }
      if (data.action === "update") {
        dispatch({ type: "CHANGE_CHAT", payload: data });
      }
    });
    return () => {
      socket.disconnect();
    };
  }, [socketManager]);

  useEffect(() => {
    let unreadsCount = 0;
    if (chats.length > 0) {
      for (let chat of chats) {
        for (let chatUser of chat.users) {
          if (chatUser.userId === user.id) {
            unreadsCount += chatUser.unreads;
          }
        }
      }
    }
    if (unreadsCount > 0) {
      setInvisible(false);
    } else {
      setInvisible(true);
    }
  }, [chats, user.id]);

  useEffect(() => {
    if (localStorage.getItem("cshow")) {
      setShowCampaigns(true);
    }
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (whatsApps.length > 0) {
        const offlineWhats = whatsApps.filter((whats) => {
          return (
            whats.status === "qrcode" ||
            whats.status === "PAIRING" ||
            whats.status === "DISCONNECTED" ||
            whats.status === "TIMEOUT" ||
            whats.status === "OPENING"
          );
        });
        if (offlineWhats.length > 0) {
          setConnectionWarning(true);
        } else {
          setConnectionWarning(false);
        }
      }
    }, 2000);
    return () => clearTimeout(delayDebounceFn);
  }, [whatsApps]);

  const fetchChats = async () => {
    try {
      const { data } = await api.get("/chats/", {
        params: { searchParam, pageNumber },
      });
      dispatch({ type: "LOAD_CHATS", payload: data.records });
    } catch (err) {
      toastError(err);
    }
  };

  const handleClickLogout = () => {
    //handleCloseMenu();
    handleLogout();
  };

  return (
    <div onClick={drawerClose} className="sideMenu">
      <Can
        role={user.profile}
        perform="dashboard:view"
        yes={() => (
          <ListItemLink
            to="/"
            primary="Dashboard"
            icon={<RxDashboard style={{ fontSize: "18px" }} />}
          />
        )}
      />
      <div className="whatsapp"></div>

      {!user.superbp && (
        <ListItemLink
          to="/tickets"
          primary={i18n.t("mainDrawer.listItems.tickets")}
          icon={<FaWhatsapp style={{ fontSize: "18px" }} />}
        />
      )}

      {!user.superbp && (
        <ListItemLink
          to="/quick-messages"
          primary={i18n.t("mainDrawer.listItems.quickMessages")}
          icon={<MdOutlineQuickreply style={{ fontSize: "18px" }} />}
        />
      )}

      <ListItemLink
        to="/contacts"
        primary={i18n.t("mainDrawer.listItems.contacts")}
        icon={<RiContactsLine style={{ fontSize: "18px" }} />}
      />

      <ListItemLink
        to="/schedules"
        primary={i18n.t("mainDrawer.listItems.schedules")}
        icon={<FaRegCalendarCheck style={{ fontSize: "18px" }} />}
      />

      {!user.superbp && (
        <ListItemLink
          className="tabulacao"
          to="/tags"
          primary={i18n.t("mainDrawer.listItems.tags")}
          icon={<LuTags style={{ fontSize: "18px" }} />}
        />
      )}

      <Can
        role={user.profile}
        perform="drawer-admin-items:view"
        yes={() => (
          <>
            <Divider />

            <ListSubheader
              hidden={collapsed}
              style={{
                position: "relative",
                fontSize: "17px",
                textAlign: "left",
                paddingLeft: 20
              }}
              inset
              color="inherit"
            >
              {i18n.t("mainDrawer.listItems.administration")}
            </ListSubheader>

            <Divider />

            <ListSubheader
              hidden={collapsed}
              style={{
                position: "relative",
                fontSize: "17px",
                textAlign: "left",
                paddingLeft: 20
              }}
              inset
              color="inherit"
            >
              {i18n.t("mainDrawer.listItems.administration")}
            </ListSubheader>

            {user.super && showCampaigns && (
              <>
                {user.super && (
                  <ListItem
                    button
                    onClick={() => setOpenRelatoriesSubmenu(prev => !prev)}
                  >
                    <ListItemIcon>
                      <FaFileCsv style={{ fontSize: "20px" }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={i18n.t("mainDrawer.listItems.relatories")}
                      style={{
                        marginLeft: "-15px",
                        fontWeight: "bold",
                        fontSize: "14px",
                        display: "flex",
                        alignItems: "center"
                      }}
                    />
                    {openRelatoriesSubmenu ? (
                      <ExpandLessIcon />
                    ) : (
                      <ExpandMoreIcon />
                    )}
                  </ListItem>
                )}

                <Collapse
                  style={{ paddingLeft: 15 }}
                  in={openRelatoriesSubmenu}
                  timeout="auto"
                  unmountOnExit
                >
                  <List component="div" disablePadding>
                    {user.super && (
                      <ListItemLink
                        button
                        onClick={handleNavigateToHistory}
                        to="/history/relatories"
                        icon={
                          <RiFileHistoryLine style={{ fontSize: "18px" }} />
                        }
                        primary={i18n.t("mainDrawer.listItems.history")}
                        style={{
                          fontWeight: "bold",
                          fontSize: "14px",
                          marginLeft: "-15px",
                          display: "flex",
                          alignItems: "center"
                        }}
                      />
                    )}

{user.super && (
                      <ListItemLink
                        button
                        onClick={handleNavigateToHistory}
                        to="/template/relatories"
                        icon={
                          <RiFileHistoryLine style={{ fontSize: "18px" }} />
                        }
                        primary={i18n.t("mainDrawer.listItems.templates")}
                        style={{
                          fontWeight: "bold",
                          fontSize: "14px",
                          marginLeft: "-15px",
                          display: "flex",
                          alignItems: "center"
                        }}
                      />
                    )}

                    
                    {user.super && (
                      <ListItemLink
                        to="/test"
                        icon={<MdSendAndArchive style={{ fontSize: "18px" }} />}
                        primary={i18n.t("mainDrawer.listItems.relatoriesFull")}
                        style={{
                          fontWeight: "bold",
                          fontSize: "14px",
                          marginLeft: "-15px",
                          display: "flex",
                          alignItems: "center"
                        }}
                      />
                    )}

                    {user.super && (
                      <ListItemLink
                        onClick={handleGenerateCSV}
                        to="/shooting"
                        icon={<MdSendAndArchive style={{ fontSize: "18px" }} />}
                        primary={i18n.t("mainDrawer.listItems.shooting")}
                        style={{
                          fontWeight: "bold",
                          fontSize: "14px",
                          marginLeft: "-15px",
                          display: "flex",
                          alignItems: "center"
                        }}
                      />
                    )}

                    {user.super && (
                      <ListItemLink
                        button
                        onClick={handleNavigateToHistory}
                        to="/csvReport"
                        icon={
                          <HiOutlineDocumentReport
                            style={{ fontSize: "18px" }}
                          />
                        }
                        primary={i18n.t("mainDrawer.listItems.csv")}
                        style={{
                          fontWeight: "bold",
                          fontSize: "14px", 
                          marginLeft: "-15px",
                          display: "flex",
                          alignItems: "center"
                        }}
                      />
                    )}
                  </List>
                </Collapse>
              </>
            )}

            {showCampaigns && (
              <>
                <ListItem
                  button
                  onClick={() => setOpenCampaignsSubmenu(prev => !prev)}
                >
                  <ListItemIcon>
                    <GoPaperAirplane style={{ fontSize: "20px" }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={i18n.t("mainDrawer.listItems.campaigns")}
                    style={{
                      marginLeft: "-15px",
                      fontWeight: "bold",
                      fontSize: "5px"
                    }}
                  />
                  {openCampaignsSubmenu ? (
                    <ExpandLessIcon />
                  ) : (
                    <ExpandMoreIcon />
                  )}
                </ListItem>
                <Collapse
                  style={{ paddingLeft: 15 }}
                  in={openCampaignsSubmenu}
                  timeout="auto"
                  unmountOnExit
                >
                  <List component="div" disablePadding>
                    <ListItem onClick={() => history.push("/campaigns")} button>
                      <ListItemIcon>
                        <MdPlaylistAddCheckCircle
                          style={{ fontSize: "18px" }}
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary="Gerenciar Disparo"
                        style={{
                          marginLeft: "-15px",
                          fontWeight: "bold",
                          fontSize: "5px"
                        }}
                      />
                    </ListItem>
                    <ListItem
                      onClick={() => history.push("/contact-lists")}
                      button
                    >
                      <ListItemIcon>
                        <PeopleIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary="Base de Clientes"
                        style={{
                          marginLeft: "-15px",
                          fontWeight: "bold",
                          fontSize: "5px"
                        }}
                      />
                    </ListItem>
                    <ListItem
                      onClick={() => history.push("/campaigns-config")}
                      button
                    >
                      <ListItemIcon>
                        <IoMdSettings style={{ fontSize: "18px" }} />
                      </ListItemIcon>
                      <ListItemText
                        primary="Configurações"
                        style={{
                          marginLeft: "-15px",
                          fontWeight: "bold",
                          fontSize: "5px"
                        }}
                      />
                    </ListItem>
                  </List>
                </Collapse>
              </>
            )}

            {user.super && (
              <ListItemLink
                className="informativos"
                to="/announcements"
                primary={i18n.t("mainDrawer.listItems.annoucements")}
                icon={<AnnouncementIcon style={{ fontSize: "18px" }} />}
              />
            )}

            <ListItemLink
              to="/connections"
              primary={i18n.t("mainDrawer.listItems.connections")}
              icon={
                <Badge badgeContent={connectionWarning ? "!" : 0} color="error">
                  <MdOutlinePhonelink style={{ fontSize: "18px" }} />
                </Badge>
              }
            />

            <ListItemLink
              to="/files"
              primary={i18n.t("mainDrawer.listItems.files")}
              icon={<SlDocs style={{ fontSize: "18px" }} />}
            />

            {!user.superbp && (
              <ListItemLink
                to="/queues"
                primary={i18n.t("mainDrawer.listItems.queues")}
                icon={<FaTasks style={{ fontSize: "18px" }} />}
              />
            )}

            {!user.superbp && (
              <ListItemLink
                className="users"
                to="/users"
                primary={i18n.t("mainDrawer.listItems.users")}
                icon={<HiOutlineUserGroup style={{ fontSize: "18px" }} />}
              />
            )}
          
          {showTemplate && (
            <ListItemLink
              className="templates"
              to="/templates"
              primary={i18n.t("mainDrawer.listItems.templates")}
              icon={<VscNotebookTemplate style={{ fontSize: "18px" }} />}
            />
          )}

            <ListItemLink
              to="/settings"
              primary={i18n.t("mainDrawer.listItems.settings")}
              icon={<IoSettingsOutline style={{ fontSize: "18px" }} />}
            />

            {!collapsed && (
              <React.Fragment>
                <Divider />
                {/* 
              // IMAGEM NO MENU
              <Hidden only={['sm', 'xs']}>
                <img style={{ width: "100%", padding: "10px" }} src={logo} alt="image" />            
              </Hidden> 
              */}
                <Typography
                  style={{
                    fontSize: "12px",
                    padding: "10px",
                    textAlign: "right",
                    fontWeight: "bold"
                  }}
                >
                  {`${version}`}
                </Typography>
              </React.Fragment>
            )}
          </>
        )}
      />
    </div>
  );
};

export default MainListItems;