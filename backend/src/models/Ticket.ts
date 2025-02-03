import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  ForeignKey,
  BelongsTo,
  HasMany,
  AutoIncrement,
  Default,
  BeforeCreate,
  BelongsToMany,
  AllowNull,
  BeforeUpdate
} from "sequelize-typescript";
import { v4 as uuidv4 } from "uuid";

import Contact from "./Contact";
import Message from "./Message";
import Queue from "./Queue";
import User from "./User";
import Whatsapp from "./Whatsapp";
import Company from "./Company";
import QueueOption from "./QueueOption";
import Tag from "./Tag";
import TicketTag from "./TicketTag";
import QueueIntegrations from "./QueueIntegrations";
import Prompt from "./Prompt";
import { DataTypes } from "sequelize";
import Template from "./Template";

@Table
class Ticket extends Model<Ticket> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column({ defaultValue: "pending" })
  status: string;

  @Column
  unreadMessages: number;

  @Column
  lastMessage: string;

  @Column
  lastMessageapi: string;

  @Default(false)
  @Column
  isGroup: boolean;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @ForeignKey(() => User)
  @Column
  userId: number;

  @BelongsTo(() => User)
  user: User;

  @ForeignKey(() => Contact)
  @Column
  contactId: number;

  @BelongsTo(() => Contact)
  contact: Contact;

  @ForeignKey(() => Whatsapp)
  @Column
  whatsappId: number;

  @BelongsTo(() => Whatsapp)
  whatsapp: Whatsapp;

  @ForeignKey(() => Queue)
  @Column
  queueId: number;

  @BelongsTo(() => Queue)
  queue: Queue;

  @Column
  chatbot: boolean;

  @ForeignKey(() => QueueOption)
  @Column
  queueOptionId: number;

  @BelongsTo(() => QueueOption)
  queueOption: QueueOption;

  @HasMany(() => Message)
  messages: Message[];

  @HasMany(() => TicketTag)
  ticketTags: TicketTag[];

  @BelongsToMany(() => Tag, () => TicketTag)
  tags: Tag[];

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @AllowNull(true)
  @Column
  templateId: number;

  @BelongsTo(() => Company)
  company: Company;

  @Default(uuidv4())
  @Column
  uuid: string;

  @BeforeCreate
  static setUUID(ticket: Ticket) {
    ticket.uuid = uuidv4();
  }
  
  @Default(false)
  @Column
  useIntegration: boolean;

  @ForeignKey(() => QueueIntegrations)
  @Column
  integrationId: number;

  @BelongsTo(() => QueueIntegrations)
  queueIntegration: QueueIntegrations;

  @Column
  typebotSessionId: string;

  @Default(false)
  @Column
  typebotStatus: boolean

  @ForeignKey(() => Prompt)
  @Column
  promptId: number;

  @BelongsTo(() => Prompt)
  prompt: Prompt;

  @Column
  fromMe: boolean;

  @Default(0)
  @Column
  templateResponseCount: number;

  @BeforeUpdate
  static async handleTemplateResponseCount(ticket: Ticket) {
    const dateTemplateWasSet = ticket.dateTemplate != null;
    const fromMeWasFalse = ticket.changed('fromMe') && ticket.fromMe === false;
    const lastMessageWasUpdated = ticket.changed('lastMessage') && dateTemplateWasSet;

    if ((fromMeWasFalse || lastMessageWasUpdated) && dateTemplateWasSet) {
      if (ticket.templateResponseCount === 0) {
        ticket.templateResponseCount = 1; 
      }
    }
  }

  @Column({
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: null, 
  })
  cpnTickets: boolean | null | object;
  
  @Column
  mainTemplate: boolean;

  @Column
  retryTemplate: boolean;

  @Column
  lastTemplate: boolean;

  @Column
  dateTemplate: Date;

  @Column
  cpc: boolean;

  @AllowNull(false)
  @Default(0)
  @Column
  amountUsedBotQueues: number;
}

export default Ticket;