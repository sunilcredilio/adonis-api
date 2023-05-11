import Profile from "App/Models/Profile";
import User from "App/Models/User";
import UserProfileValidator from "App/Validators/UserProfileValidator";
import moment from "moment";

export default class ProfilesController {
  //For creating the registered user profile
  public async createuserProfile({ request, response, auth }) {
    try {
      const loginUserId = await auth.user.id;
      //Checking if the profile already exist
      const profile = await Profile.findBy("user_id", loginUserId);
      if (profile !== null) {
        throw new Error("Profile already exists");
      } else {
        const { name, gender, mobileNumber, dateOfBirth } =
          await request.validate(UserProfileValidator);
        const existedUser = await Profile.findBy("mobile_number", mobileNumber);

        //checking age if less than 18 throwing the error
        const age = moment().diff(new Date(dateOfBirth), "years");
        if (age < 18 || age > 80) {
          throw new Error("Invalid age");
        }

        //checking mobile number is not used by any other users
        if (existedUser !== null) {
          throw new Error("Mobile number already used");
        } else {
          const profile = await Profile.create({
            name,
            gender,
            mobileNumber,
            dateOfBirth,
            userId: loginUserId,
          });
          response.created(profile);
        }
      }
    } catch (error) {
      throw error;
    }
  }
  //For getting the profile of login user
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
  //For updating the login user profile
  public async updateUserProfile({ request, response, auth }) {
    try {
      const loginuserId = await auth.user.id;
      const exitsedProfile = await Profile.findByOrFail("userId", loginuserId);
      const { name, gender, mobileNumber, dateOfBirth } =
        await request.validate(UserProfileValidator);

      //checking age if less than 18 throwing the error
      const age = moment().diff(new Date(dateOfBirth), "years");
      if (age < 18 || age >80) {
        throw new Error("Invalid age");
      }

      //checking that new mobile number is not belongs to any other user
      if (exitsedProfile.mobileNumber !== mobileNumber) {
        const profile = Profile.findBy("mobileNumber", mobileNumber);
        if (profile !== null) {
          throw new Error("Mobile number already used");
        }
      }
      exitsedProfile.name = name;
      exitsedProfile.gender = gender;
      exitsedProfile.dateOfBirth = dateOfBirth;
      exitsedProfile.mobileNumber = mobileNumber;
      const updatedProfile = await exitsedProfile.save();
      response.ok(updatedProfile);
    } catch (error) {
      throw error;
    }
  }

  //For deleting the user and profile based on mobile number
  public async deleteUserProfile({ request, response, auth }) {
    try {
      const mobileNumber = request.input("mobileNumber");
      //checking mobile number provide by user
      if(mobileNumber === undefined){
        throw new Error("Mobile number required");
      }

      let validationResult = /^[0-9]{10}$/.test(mobileNumber);
      if (validationResult === true) {
        const profile = await Profile.findByOrFail(
          "mobile_number",
          mobileNumber
        );
        const user = await User.findOrFail(profile.userId);
        //Checking that update profile is belongs to the login user
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
