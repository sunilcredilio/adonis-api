/*
|--------------------------------------------------------------------------
| Http Exception Handler
|--------------------------------------------------------------------------
|
| AdonisJs will forward all exceptions occurred during an HTTP request to
| the following class. You can learn more about exception handling by
| reading docs.
|
| The exception handler extends a base `HttpExceptionHandler` which is not
| mandatory, however it can do lot of heavy lifting to handle the errors
| properly.
|
*/

import Logger from "@ioc:Adonis/Core/Logger";
import HttpExceptionHandler from "@ioc:Adonis/Core/HttpExceptionHandler";
import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import UnauthorizedError from "./CustomErrors/UnauthorizedError";
import ResourceExistError from "./CustomErrors/ResourceExistError";

export default class ExceptionHandler extends HttpExceptionHandler {
  constructor() {
    super(Logger);
  }

  showMessage(message: string) {
    return {
      message,
      timestamp: new Date(),
    };
  }

  //Handling all the errors and send the response based on error
  public async handle( error: any, { response }: HttpContextContract ): Promise<any> {

    if (error.code === "E_VALIDATION_FAILURE") {
      interface Error {
        field: string;
        message: string;
      }
      // Only returning the field and message to the user 
      const allValidationMessages = error.messages.errors.reduce(
        (allValidationErrors: Object[], error: Error) => {
          const errorField = allValidationErrors.filter(
            (validationError: Error) => {
              return validationError.field === error.field;
            }
          );
          if (errorField.length === 0) {
            const validationMessage = {};
            validationMessage["field"] = error.field,
            validationMessage["message"] = error.message;
            allValidationErrors.push(validationMessage);
          }
          return allValidationErrors;
        },[]);
      response.badRequest({
        messages: allValidationMessages,
        timestamp: new Date(),
      });
    } else if (error.constraint === "users_email_unique") {
      response.conflict(this.showMessage("Email already registered"));
    } else if (error.code === "E_INVALID_AUTH_UID") {
      response.unauthorized(this.showMessage("Invalid email address"));
    } else if (error.code === "E_INVALID_AUTH_PASSWORD") {
      response.unauthorized(this.showMessage("Invalid password"));
    } else if (error.code === "E_ROUTE_NOT_FOUND") {
      response.notFound(this.showMessage("The url you are looking for doesn't exist"));
    } else if (error.code === "E_ROW_NOT_FOUND") {
      response.notFound(this.showMessage("Record not found"));
    } else if (error.code === "E_UNAUTHORIZED_ACCESS" ||error instanceof UnauthorizedError) {
      response.unauthorized(this.showMessage("Unauthorized access"));
    } else if (error instanceof ResourceExistError) {
      response.conflict(this.showMessage(error.message));
    } else {
      response.internalServerError(this.showMessage("Something went wrong"));
    }
  }
}
