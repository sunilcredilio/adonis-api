import ResourceExistError from "App/Exceptions/CustomErrors/ResourceExistError";
import UnauthorizedError from "App/Exceptions/CustomErrors/UnauthorizedError";
import Profile from "App/Models/Profile";
import User from "App/Models/User";
import UserProfileUpdateValidator from "App/Validators/UserProfileUpdateValidator";
import UserProfileCreateValidator from "App/Validators/UserProfileCreateValidator";
import MobileNumberValidator from "App/Validators/MobileNumberValidator";

export default class ProfileController {
  //For creating the registered user profile
  public async createUserProfile({ request, response, auth }) {
    try {
      const userId = auth.user.id;
      const profile = await Profile.findBy("user_id", userId);

      if (profile) {
        throw new ResourceExistError("Profile already exists");
      } else {
        const { name, gender, mobileNumber, dateOfBirth } =
          await request.validate(UserProfileCreateValidator);
        const profile = await Profile.create({
          name,
          gender,
          mobileNumber,
          dateOfBirth,
          userId,
        });
        response.created(profile);
      }
    } catch (error) {
      throw error;
    }
  }

  //For getting the profile of login user
  public async getUserProfile({ response, auth }) {
    try{
      const userId = auth.user.id;
      const userProfile = await Profile.findByOrFail("userId", userId);
      const user = await User.findOrFail(userId);
      const userDetails = {
        name: userProfile.name,
        email: user.email,
        gender: userProfile.gender,
        dateOfBirth: new Date(userProfile.dateOfBirth).toLocaleDateString(),
      };
      response.ok(userDetails);
    }
    catch(error){
      throw error;
    }
  }

  //For updating the login user profile
  public async updateUserProfile({ request, response, auth }) {
    try {
      const userId = auth.user.id;
      await Profile.findByOrFail("userId", userId);
      const { name, gender, mobileNumber, dateOfBirth } =
        await request.validate(UserProfileUpdateValidator);

      await Profile.query().where('userId',userId).update({
        name,
        gender,
        dateOfBirth,
        mobileNumber
      });

      const userProfile = await Profile.findByOrFail('userId',userId);
      response.ok(userProfile);
    } catch (error) {
      throw error;
    }
  }

  //For deleting the user and profile based on mobile number
  public async deleteUserProfile({ request, response, auth }) {
    try {
      const {mobileNumber} = await request.validate(MobileNumberValidator);
      const userProfile = await Profile.findByOrFail("mobileNumber",mobileNumber);
      const user = await User.findOrFail(auth.user.id);
      
      if(userProfile.userId === user.id){
        //In migration on delete cascade is used. It will be automatically delete the related profile and api_tokens with user.
        await user.delete();
            response.ok({
              message: "User and profile deleted successfully",
              timestamp: new Date(),
            });
      }else{
        throw new UnauthorizedError("Unauthorized access");
      }
    } catch (error) {
      throw error;
    }
  }
}
