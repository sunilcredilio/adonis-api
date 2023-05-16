import { DateTime } from "luxon";
import { BaseModel, column } from "@ioc:Adonis/Lucid/Orm";

export default class Profile extends BaseModel {
  @column({ columnName:"id", isPrimary: true })
  public id: number;

  @column({ columnName: "name" })
  public name: string;

  @column({ columnName: "mobile_number" })
  public mobileNumber: string;

  @column({ columnName: "gender" })
  public gender: string;

  @column({ columnName: "date_of_birth" })
  public dateOfBirth: Date;

  @column({ columnName: "user_id" })
  public userId: Number;

  @column.dateTime({ columnName: "created_at", autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ columnName: "updated_at", autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;
}
