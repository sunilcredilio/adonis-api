import User from "App/Models/User";
import UserRegisterValidator from "App/Validators/UserRegisterValidator";

export default class AuthController {
  //For Registering the user
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
  // For login the user on successful login, returning the token
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
  //Revoking the token from api_tokens table
  public async logout({ response, auth }) {
    await auth.use("api").revoke();
    response.status(200).json({
      revoked: true,
    });
  }
}
