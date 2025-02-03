import { Model, Table, Column, PrimaryKey, AutoIncrement, CreatedAt, UpdatedAt, ForeignKey, BelongsTo } from "sequelize-typescript";
import Company from "./Company";

@Table
class TemplateHistory extends Model<TemplateHistory> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  reportName: string;

  @Column
  url: string;  

  @CreatedAt
  @Column
  createdAt: Date;

  @UpdatedAt
  @Column
  updatedAt: Date;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;
}

export default TemplateHistory;
