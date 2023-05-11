import { schema, CustomMessages, rules } from "@ioc:Adonis/Core/Validator";
import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";

export default class UserProfileValidator {
  constructor(protected ctx: HttpContextContract) {}

  /*
   * Define schema to validate the "shape", "type", "formatting" and "integrity" of data.
   *
   * For example:
   * 1. The username must be of data type string. But then also, it should
   *    not contain special characters or numbers.
   *    ```
   *     schema.string({}, [ rules.alpha() ])
   *    ```
   *
   * 2. The email must be of data type string, formatted as a valid
   *    email. But also, not used by any other user.
   *    ```
   *     schema.string({}, [
   *       rules.email(),
   *       rules.unique({ table: 'users', column: 'email' }),
   *     ])
   *    ```
   */
  public schema = schema.create({
    name: schema.string({ trim: true }, [
      rules.minLength(3),
      rules.maxLength(30)
    ]),
    mobileNumber: schema.string({trim:true},[
      rules.regex(/^[0-9]{10}$/),
      rules.unique({table:'profiles',column:'mobile_number'})
    ]),
    gender: schema.enum(
      ['MALE','FEMALE'] as const
    ),
    dateOfBirth: schema.date()
  });

  /**
   * Custom messages for validation failures. You can make use of dot notation `(.)`
   * for targeting nested fields and array expressions `(*)` for targeting all
   * children of an array. For example:
   *
   * {
   *   'profile.username.required': 'Username is required',
   *   'scores.*.number': 'Define scores as valid numbers'
   * }
   *
   */
  public messages: CustomMessages = {
    "required": "{{field}} is required",
    "name.minLength":"Name should be atleast of 3 characters",
    "name.maxLength":"Name should be atleast of 30 characters",
    "mobileNumber.regex":"Invalid mobile number",
    "mobileNumber.unique":"Mobile number already used",
    "gender.enum":"Gender should be either MALE or FEMALE",
    "dateOfBirth.date":"Invalid date"
  };
}
