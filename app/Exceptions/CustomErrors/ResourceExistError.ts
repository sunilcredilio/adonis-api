export default class ResourceExistError extends Error {
    constructor(message: string) {
      super(message);
    }
}