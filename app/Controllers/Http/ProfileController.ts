import Profile from "App/Models/Profile";
import UserProfileValidator from "App/Validators/UserProfileValidator";

export default class ProfilesController {
  public async createuserProfile({ request, response, auth }) {
    try {
      const loginUserId = await auth.user.id;
      const profile = await Profile.findBy("user_id", loginUserId);
      if (profile !== null) {
        throw new Error("Profile already exists");
      } else {
        const { name, gender, mobileNumber, dateOfBirth } =
          await request.validate(UserProfileValidator);
        const profile = await Profile.create({
          name,
          gender,
          mobileNumber,
          dateOfBirth,
          userId: loginUserId,
        });
        response.created(profile);
      }
    } catch (error) {
      throw error;
    }
  }
}
