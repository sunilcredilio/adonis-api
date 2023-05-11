import { DateTime } from "luxon";
import { BaseModel, HasOne, column, hasOne } from "@ioc:Adonis/Lucid/Orm";
import Profile from "./Profile";

export default class User extends BaseModel {
  @column({ columnName: "id", isPrimary: true })
  public id: number;

  @column({ columnName: "email" })
  public email: string;

  @column({ columnName: "password", serializeAs: null })
  public password: string;

  @hasOne(() => Profile)
  public profile: HasOne<typeof Profile>;

  @column.dateTime({ columnName: "created_at", autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ columnName: "updated_at", autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;
}
