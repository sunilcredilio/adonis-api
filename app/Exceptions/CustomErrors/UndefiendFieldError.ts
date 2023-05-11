export default class UndefinedFieldError extends Error {

  message: string;
  fieldName: string;

  constructor(message: string, fieldName: string) {
    super();
    this.message = message;
    this.fieldName = fieldName;
  }
}
