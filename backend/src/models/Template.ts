import { Model, Table, Column, PrimaryKey, AutoIncrement, BelongsTo, ForeignKey, CreatedAt, UpdatedAt } from "sequelize-typescript";
import Company from "./Company";

@Table
class Template extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  name: string;

  @Column
  mainTemplate: string;

  @Column
  retryTemplate: string;

  @Column
  lastTemplate: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;
}

export default Template; 