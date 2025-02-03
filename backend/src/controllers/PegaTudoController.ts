import { Request, Response } from "express";

import SimpleContactListService, {
    SearchContactParams
  } from "../services/ContactServices/SimpleListService";
import SimpleUserListService from "../services/UserServices/SimpleListService";
import ListAllTicketsService from "../services/TicketServices/ListAllTicketService";
import FindAllCompaniesService from "../services/CompanyService/FindAllCompaniesService";
import ListMessagesService from "../services/MessageServices/ListMessagesService";

import Message from "../models/Message";
import ListMessagesForAdminService from "../services/MessageServices/ListMessagesForAdminService";
import ListMessagesHistoryServices from "../services/MessageServices/ListMessagesHistoryService";

type IndexQuery = {
    searchParam: string;
    pageNumber: string;
    status: string;
    date: string;
    updatedAt?: string;
    showAll: string;
    withUnreadMessages: string;
    queueIds: string;
    tags: string;
    users: string;
    isReport?: string;  
  };

  interface Ticket {
    id: string;
    status: string;
    contactId: string;
    userId: string;
    companyId: string;
    createdAt: string;
    updatedAt: string;
    fromMe: boolean;
    tags?: Array<{ id: number; name: string }>;
  }
  
  interface Contact {
    id: string;
    name: string;
    number: string;
    cnpj_cpf: string;
    contract: string;
  }
  
  interface User {
    id: string;
    name: string;
    cpfUser: string;
  }
  
  interface Company {
    id: string;
    name: string;
  }

  interface FetchMessagesParams {
    ticketId: string;
    pageNumber?: string;
  }

const fetchTickets = async (query: any) => {
  const {
    status,
    date,
    updatedAt,
    searchParam,
    showAll,
    queueIds,
    tags,
    users,
    withUnreadMessages,
    isReport
  } = query;
  
  
    // Pass isReport para o serviço
  const { tickets, count, hasMore } = await ListAllTicketsService({
      searchParam,
      tags,
      users,
      status,
      date,
      updatedAt,
      showAll,
      userId: null, // Modifique conforme sua implementação
      queueIds,
      withUnreadMessages,
      companyId: null, // Modifique conforme sua implementação
      isReport: isReport === "true" // Garantir que isReport seja passado como um booleano
  });
  
    return tickets;
  };

const fetchContacts = async (query: any) => {
  const { name, number, page = 1, limit = 10,  isReport = "true"} = query;

  const { contacts, totalContacts } = await SimpleContactListService({
    name: name as string | undefined,
    number: number as string | undefined,
    page: Number(page),
    limit: limit ? Number(limit) : undefined, 
    isReport: Boolean(isReport)
  });

  return contacts;

};

const fetchCompanies = async () => {
  const companies = await FindAllCompaniesService();

  return companies;

}

const fetchUsers = async () => {
  const  companyId  = undefined;

    const users = await SimpleUserListService({
        companyId
    });

  return users;

}

const fetchMessages = async ({
  ticketId,
  pageNumber = '1',
}: FetchMessagesParams): Promise<{
  count: number;
  messages: Message[];
  ticket: any;
  hasMore: boolean;
}> => {
  const queues: number[] = [];

  // Buscar mensagens utilizando o serviço
  const { count, messages, ticket, hasMore } = await ListMessagesHistoryServices({
    pageNumber,
    ticketId,
    queues,
  });
  // Retornar os dados relevantes
  return { count, messages, ticket, hasMore };

   
};

export const list = async (req: Request, res: Response): Promise<Response> => {
  try{
    const {
      status,
      date,
      updatedAt,
      searchParam,
      showAll,
      queueIds: queueIdsStringified,
      tags: tagIdsStringified,
      users: userIdsStringified,
      withUnreadMessages,
      isReport,
    } = req.query as IndexQuery;

    let queueIds: number[] = [];
    let tagsIds: number[] = [];
    let usersIds: number[] = [];
    
    if (queueIdsStringified) {
        queueIds = JSON.parse(queueIdsStringified);
    }
    
    if (tagIdsStringified) {
        tagsIds = JSON.parse(tagIdsStringified);
    }
    
    if (userIdsStringified) {
        usersIds = JSON.parse(userIdsStringified);
    }
    
    const users = await fetchUsers();
    const tickets = await fetchTickets({
      searchParam,
      tags: tagsIds,
      users: usersIds,
      status,
      date,
      updatedAt,
      showAll,
      queueIds,
      withUnreadMessages,
      isReport: isReport === "true",
    });
    const contacts = await fetchContacts(req.query);
    const companies = await fetchCompanies();

    const contactsJSON: Contact[] = contacts.map( (contact) => contact.toJSON() as Contact);
    const usersJSON: User[] = users.map( user => user.toJSON() as User);
    const companiesJSON: Company[] = companies.map( company => company.toJSON() as Company);
    const ticketJSON: Ticket[] = tickets.map( ticket => ticket.toJSON() as Ticket);

      // Ajustar a data no formato brasileiro
    const adjustDate = (dateString: string) => {
        const date = new Date(dateString);
        date.setHours(date.getHours());
        return date.toLocaleString('pt-BR').replace(', ', ' ');
    };

    // Mapear os dados para um formato mais detalhado com as informações combinadas
    const reportData = ticketJSON.map((ticket) => {
        const contact = contactsJSON.find((contact) => contact.id === ticket.contactId);
        const user = usersJSON.find((user) => user.id === ticket.userId);
        const company = companiesJSON.find((company) => company.id === ticket.companyId);
        const tag = ticket.tags.map((tag) => tag.name);

        return {
        ticketId: ticket.id || '',
        companyName: company ? company.name : 'Empresa não encontrada',
        contactName: contact ? contact.name : '',
        contactNumber: contact ? contact.number : '',
        contactCnpjCpf: contact ? contact.cnpj_cpf : 'CPF não encontrado',
        contactContract: contact ? contact.contract : 'Contrato não encontrado',
        userName: user ? user.name : '',
        userCpfUser: user ? user.cpfUser : '',
        ticketStatus: ticket.status || '',
        ticketTags: tag,
        firstAttendance: adjustDate(ticket.createdAt) || '',
        lastAttendance: adjustDate(ticket.updatedAt) || '',
        sent: '1', // Enviado
        confirmed: '1', // Confirmado
        failure: '0', // Falha
        interaction: ticket.fromMe ? 'Operator' : 'Client',
        readIndex: 'Visualizada', // Isso pode ser ajustado conforme lógica de leitura das mensagens
        };
    });

    // Estruturar a resposta como um JSON com a mesma estrutura do CSV
    const responseJSON = reportData.map((data) => ({
        Id: data.ticketId,
        Carteira: data.companyName,
        'Nome do Cliente': data.contactName,
        Telefone: data.contactNumber,
        'CNPJ/CPF': data.contactCnpjCpf,
        Contrato: data.contactContract,
        'Nome do Operador': data.userName,
        'CPF Operador': data.userCpfUser,
        Tabulação: data.ticketTags, // A lógica para tabulação pode ser ajustada conforme necessário
        status: data.ticketStatus,
        'Primeiro atendimento': data.firstAttendance,
        'Último Atendimento': data.lastAttendance,
        Enviado: data.sent,
        Confirmado: data.confirmed,
        Falha: data.failure,
        Leitura: data.readIndex,
        Interação: data.interaction,
    }));

    // Retornar a resposta como JSON
    return res.json(responseJSON);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const closed = async (req: Request, res: Response): Promise<Response> => {
  try{
    const {
      status,
      date,
      updatedAt,
      searchParam,
      showAll,
      queueIds: queueIdsStringified,
      tags: tagIdsStringified,
      users: userIdsStringified,
      withUnreadMessages,
      isReport
    } = req.query as IndexQuery;

    let queueIds: number[] = [];
    let tagsIds: number[] = [];
    let usersIds: number[] = [];

    if (queueIdsStringified) {
      queueIds = JSON.parse(queueIdsStringified);
    }

    if (tagIdsStringified) {
      tagsIds = JSON.parse(tagIdsStringified);
    }

    if (userIdsStringified) {
      usersIds = JSON.parse(userIdsStringified);
    }


    const contacts = await fetchContacts(req.query);
    const users = await fetchUsers();
    const tickets = await fetchTickets({
      searchParam,
      tags: tagsIds,
      users: usersIds,
      status,
      date,
      updatedAt,
      showAll,
      queueIds,
      withUnreadMessages,
      isReport: isReport === "true",
    });
    

  const contactsJSON: Contact[] = contacts.map( (contact) => contact.toJSON() as Contact);
  const usersJSON: User[] = users.map( user => user.toJSON() as User);
  const ticketJSON: Ticket[] = tickets.map( ticket => ticket.toJSON() as Ticket);

  const adjustDate = (dateString: string) => {
    const date = new Date(dateString);
    date.setHours(date.getHours());
    return date.toLocaleString('pt-BR').replace(', ', ' ');
  };

  const reportData = ticketJSON
  .filter( ticket => ticket.status == "closed")
  .map((ticket) => {
      const contact = contactsJSON.find((contact) => contact.id === ticket.contactId);
      const user = usersJSON.find((user) => user.id === ticket.userId);
      const tag = ticket.tags.map((tag) => tag.name);

      return {
      ticketId: ticket.id || '',
      contactName: contact ? contact.name : '',
      contactNumber: contact ? contact.number : '',
      contactCnpjCpf: contact ? contact.cnpj_cpf : 'CPF não encontrado',
      contactContract: contact ? contact.contract : 'Contrato não encontrado',
      userName: user ? user.name : '',
      userCpfUser: user ? user.cpfUser : '',
      ticketStatus: ticket.status || '',
      ticketTags: tag,
      firstAttendance: adjustDate(ticket.createdAt) || '',
      lastAttendance: adjustDate(ticket.updatedAt) || '',
      }; 
  });

    const responseJSON = reportData.map((data) => ({
      Id: data.ticketId,
      'Nome do Cliente': data.contactName,
      Telefone: data.contactNumber,
      'CNPJ/CPF': data.contactCnpjCpf,
      Contrato: data.contactContract,
      'Nome do Operador': data.userName,
      'CPF Operador': data.userCpfUser,
      Tabulação: data.ticketTags, // A lógica para tabulação pode ser ajustada conforme necessário
      status: data.ticketStatus,
      'Primeiro atendimento': data.firstAttendance,
      'Último Atendimento': data.lastAttendance,
  }));

  // Retornar a resposta como JSON
    return res.json(responseJSON);
  }   catch (error) {
  return res.status(500).json({ error: error.message });
  } 
};

export const pdf = async (req: Request, res: Response): Promise<Response> => {
  try{
    const {
      status,
      date,
      updatedAt,
      searchParam,
      showAll,
      queueIds: queueIdsStringified,
      tags: tagIdsStringified,
      users: userIdsStringified,
      withUnreadMessages,
      isReport
    } = req.query as IndexQuery;

    let queueIds: number[] = [];
    let tagsIds: number[] = [];
    let usersIds: number[] = [];

    if (queueIdsStringified) {
      queueIds = JSON.parse(queueIdsStringified);
    }

    if (tagIdsStringified) {
      tagsIds = JSON.parse(tagIdsStringified);
    }

    if (userIdsStringified) {
      usersIds = JSON.parse(userIdsStringified);
    }

    const tickets = await fetchTickets({
      searchParam,
      tags: tagsIds,
      users: usersIds,
      status,
      date,
      updatedAt,
      showAll,
      queueIds,
      withUnreadMessages,
      isReport: "true",
    });
    const { number }  = req.params;
    const contacts = await fetchContacts(req.query);
    const users = await fetchUsers();

    const contactsJSON: Contact[] = contacts.map( (contact) => contact.toJSON() as Contact);
    const ticketJSON: Ticket[] = tickets.map( ticket => ticket.toJSON() as Ticket);
    const usersJSON: User[] = users.map( user => user.toJSON() as User);
    const filteredContacts = contactsJSON.filter(contact => contact.number === number);
  
    const filteredTickets = filteredContacts.map(contact => {
      const returnedData = ticketJSON.find( ticket => ticket.contactId === contact.id);

      if (returnedData) {
        return{
          ticketId: returnedData.id,
          userId: returnedData.userId,
        }
      } else {
        return null;
      }
    }).filter(ticket => ticket !== null);

      const filteredUsers = filteredTickets.map(ticket => {
        const DataUsers = usersJSON.find( user => user.id === ticket.userId);

        return DataUsers;
      });

      const queryRequest = await Promise.all(
        filteredTickets.map(async (ticket) => {
          const messagesData = await fetchMessages({
            ticketId: ticket.ticketId,
            pageNumber: '1'
          });
          
          return messagesData;
        })
    );

      const queryData = queryRequest.flat();

      const count = queryData.map(query => query.count);
      const queryMessages = queryData.map(query => query.messages);

      const messages = queryMessages.flat();


      /* 

      const response = queryData.map( (message) => {

        const sender = filteredContacts.find(contact => Number(contact.id) === message.contactId);
        const messageBody = message.body;

        return  message.fromMe ? `${filteredUsers[0].name} : ${messageBody}` : `${sender.name} : ${messageBody}`;
          
      }); */

      const responseUsers = filteredUsers.flat();
    
      return res.json({messages, responseUsers});


  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};





