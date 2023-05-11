import User from "App/Models/User";
import UserRegisterValidator from "App/Validators/UserRegisterValidator";

export default class AuthController {
  public async register({ request, response }) {
    try {
      const { email, password } = await request.validate(UserRegisterValidator);
      const savedUser = await User.create({
        email,
        password,
      });
      response.created(savedUser);
    } catch (error) {
      throw error;
    }
  }
  public async login({ request, auth }) {
    try {
      const { email, password } = await request.validate(UserRegisterValidator);
      const token = await auth
        .use("api")
        .attempt(email.toLowerCase(), password, {
          expiresIn: "10 days",
        });
      return token.toJSON();
    } catch (error) {
      throw error;
    }
  }
}
