const {
  registerUser,
  loginUser,
  logoutUser,
  forgotPassword,
  resetPassword,
  getUserDetails,
  updateUserPassword,
  updateUserProfile,
  getAllUsers,
  getSingleUser,
  updateUserRole,
  deleteUser,
} = require("../controllers/userController");
const { isAuthenticatedUser, authorizedRoles } = require("../middleware/auth");

const router = require("express").Router();

// register user route
router.route("/register").post(registerUser);

//login user route
router.route("/login").post(loginUser);

//logout user route
router.route("/logout").get(logoutUser);

//forgot password route
router.route("/password/forgot").post(forgotPassword);

//reset password route
router.route("/password/reset/:token").put(resetPassword);

// get user details route
router.route("/user/me").get(isAuthenticatedUser, getUserDetails);

// update password route
router.route("/password/update").put(isAuthenticatedUser, updateUserPassword);

//update user profile route
router.route("/profile/update").put(isAuthenticatedUser, updateUserProfile);

//get all users route
router.route("/admin/users").get(isAuthenticatedUser, authorizedRoles("admin"), getAllUsers);

//get single user details route
router
  .route("/admin/user/:id")
  .get(isAuthenticatedUser, authorizedRoles("admin"), getSingleUser)
  .put(isAuthenticatedUser, authorizedRoles("admin"), updateUserRole)
  .delete(isAuthenticatedUser, authorizedRoles("admin"), deleteUser);

module.exports = router;
