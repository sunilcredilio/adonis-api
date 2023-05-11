import Profile from "App/Models/Profile";
import User from "App/Models/User";
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

  public async getUserProfile({ response, auth }) {
    try {
      const loginUserId = await auth.user.id;
      const userProfile = await Profile.findByOrFail("userId", loginUserId);
      const user = await User.findOrFail(loginUserId);
      const userDetails = {
        name: userProfile.name,
        email: user.email,
        gender: userProfile.gender,
        dateOfBirth: new Date(userProfile.dateOfBirth).toLocaleDateString(),
      };
      response.ok(userDetails);
    } catch (error) {
      throw error;
    }
  }
  public async updateUserProfile({}) {}

  public async deleteUserProfile({ request, response, auth }) {
    try {
      const mobileNumber = request.input("mobileNumber");
      let validationResult = /^[0-9]{10}$/.test(mobileNumber);
      if (validationResult === true) {
        const profile = await Profile.findByOrFail(
          "mobile_number",
          mobileNumber
        );
        const user = await User.findOrFail(profile.userId);
        if (profile.userId === auth.user.id) {
          user.delete();
          response.ok({
            message: "User and profile deleted successfully",
            timestamp: new Date(),
          });
        } else {
          throw new Error("Unauthorized access");
        }
      } else {
        throw new Error("Invalid mobile number");
      }
    } catch (error) {
      throw error;
    }
  }
}
