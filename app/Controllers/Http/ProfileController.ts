import InvalidDataError from "App/Exceptions/CustomErrors/InvalidDataError";
import ResourceExistError from "App/Exceptions/CustomErrors/ResourceExistError";
import UnauthorizedError from "App/Exceptions/CustomErrors/UnauthorizedError";
import UndefinedFieldError from "App/Exceptions/CustomErrors/UndefiendFieldError";
import Profile from "App/Models/Profile";
import User from "App/Models/User";
import UserProfileValidator from "App/Validators/UserProfileValidator";
import moment from "moment";

export default class ProfileController {

  //For creating the registered user profile
  public async createuserProfile({ request, response, auth }) {
    try {
      const loginUserId = await auth.user.id;
      const profile = await Profile.findBy("user_id", loginUserId);

      //Checking if the profile already exist
      if(profile !== null){
        throw new ResourceExistError("Profile already exists");
      }else{
        const { name, gender, mobileNumber, dateOfBirth } =
          await request.validate(UserProfileValidator);
        //Getting the age by using moment package
        const age = moment().diff(new Date(dateOfBirth), "years");
        //Finding the user based on mobile number, for checking same mobile number doesn't belongs to other user
        const existedProfile = (mobileNumber !== undefined) && await Profile.findBy("mobile_number", mobileNumber);

        //Checking fields after validation, some fields becomes undefined in case if that field contains space only  
        if (name === undefined || mobileNumber === undefined) {
          const fieldName = !name ? "name" : "mobileNumber";
          throw new UndefinedFieldError(`${name} required`, fieldName); 
        }else if(age <18 || age >80){
          throw new InvalidDataError("Age should be between 18-80");
        }else if(existedProfile !== null){
          throw new ResourceExistError("Mobile number already used");
        }else{
          //Create the profile and saved the data on database
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
      const age = moment().diff(new Date(dateOfBirth), "years");

      if (name === undefined || mobileNumber === undefined) {
        const fieldName = !name ? "name" : "mobileNumber";
        throw new UndefinedFieldError(`${name} required`, fieldName); 
      }else if(age <18 || age >80){
        throw new InvalidDataError("Age should be between 18-80");
      }else if(exitsedProfile.mobileNumber !== mobileNumber){
        //Checking mobile number to be update doesn't belongs to other user
        const profile = Profile.findBy("mobileNumber", mobileNumber);
        if (profile !== null) {
          throw new ResourceExistError("Mobile number already used");
        }
      }else{
        //Updating user profile
        exitsedProfile.name = name;
        exitsedProfile.gender = gender;
        exitsedProfile.dateOfBirth = dateOfBirth;
        exitsedProfile.mobileNumber = mobileNumber;
        const updatedProfile = await exitsedProfile.save();
        response.ok(updatedProfile);  
      }
    } catch (error) {
      throw error;
    }
  }

  //For deleting the user and profile based on mobile number
  public async deleteUserProfile({ request, response, auth }) {
    try {
      const mobileNumber = request.input("mobileNumber");

      //checking mobile number provide by user
      if (mobileNumber === undefined) {
        throw new InvalidDataError("Mobile number required");
      }else{
        const validMobileNumber = /^[0-9]{10}$/.test(mobileNumber);

        if(validMobileNumber === true){
          const profile = await Profile.findByOrFail("mobile_number", mobileNumber);
          const user = await User.findOrFail(profile.userId);
          //Checking the account belongs to the login user
          if(profile.userId === auth.user.id){
            await user.delete();
            response.ok({
              message: "User and profile deleted successfully",
              timestamp: new Date(),
            });
          }else{
            throw new UnauthorizedError("Unauthorized access");
          }
        }else{
          throw new InvalidDataError("Invalid mobile number");
        }
      }
    } catch (error) {
      throw error;
    }
  }
}
