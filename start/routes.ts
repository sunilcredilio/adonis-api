import Route from "@ioc:Adonis/Core/Route";

Route.post("/register", "AuthController.register");
Route.post("/login", "AuthController.login");

Route.group(() => {
  Route.post("/logout", "AuthController.logout");
  Route.group(() => {
    Route.post("/", "ProfileController.createUserProfile");
    Route.get("/", "ProfileController.getUserProfile");
    Route.put("/", "ProfileController.updateUserProfile");
    Route.delete("/", "ProfileController.deleteUserProfile");
  }).prefix("/user/profile");
}).middleware("auth:api");
