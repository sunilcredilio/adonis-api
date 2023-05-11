export default class InvalidDataError extends Error {
    constructor(message: string) {
      super(message);
    }
}