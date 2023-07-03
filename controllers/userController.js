const User = require("../models/userModel");
const sendEmail = require("../utils/sendEmail");
const sendToken = require("../utils/sendToken");
const crypto = require("crypto");

//! register user
const registerUser = async (req, res) => {
    try {
        // extracting data from req.body 
        const { name, email, password } = req.body;

        // finding the user in database 
        const existingUser = await User.findOne({ email });

        // if user exists 
        if (existingUser) {
            return res.json({
                message: "User already Exist",
                success: false,
            });
        }

        // if user not exists then create one 
        const user = await User.create({
            name,
            email,
            password,
            avatar: {
                public_id: "abc",
                url: "xyz",
            },
        });

        // sending cookie and the token to client 
        sendToken(user, res, "User registered successfully");

    } catch (error) {
        res.json({
            message: error.message,
            success: false,
        });
    }
};

//! login user
const loginUser = async (req, res) => {
    try {
        // extracting data from req.body 
        const { email, password } = req.body;

        // if doesn't got email and password from client
        if (!email || !password) {
            return res.json({
                message: "Please enter Email or password",
                success: false,
            });
        }

        // finding user based on the email got from client 
        const user = await User.findOne({ email }).select("+password");

        // if user not found 
        if (!user) {
            return res.json({
                message: "Invalid Email or Password",
                success: false,
            });
        }

        // checking for password match 
        const isPasswordMatched = await user.comparePassword(password);

        // if password not matched 
        if (!isPasswordMatched) {
            return res.json({
                message: "Invalid Email or Password",
                success: false,
            });
        }
        // sending cookie and the token to client 
        sendToken(user, res, "User logged in Successfully");

    } catch (error) {
        res.json({
            message: error.message,
            success: false,
        });
    }
};

//! logout user
const logoutUser = async (req, res) => {

    // sending an null cookie to client 
    res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true
    });

    res.json({
        message: "Logged out successfully",
        success: true,
    });
}

//! forgot password
const forgotPassword = async (req, res) => {
    // finding user based on the email got from client 
    const user = await User.findOne({ email: req.body.email });

    // if user not found 
    if (!user) {
        res.json({
            message: "user not found",
            success: false
        })
    }

    // get reset password token 
    const resetToken = await user.getResetPasswordToken();

    // saving the generated token to user 
    await user.save({ validateBeforeSave: false });

    // creating resetPassword url 
    const resetPasswordUrl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${resetToken}`

    // creating message we want to send to user 
    const message = `Your password reset token is :- \n\n ${resetPasswordUrl} \n\n If you are not requested this email then, please ignore it`

    try {
        // sending user using nodemailer
        await sendEmail({
            email: user.email,
            subject: "ShopSpot Password Recovery",
            message
        });

        res.json({
            message: `Email sent to ${user.email} successfully`,
            success: true,
        });

    } catch (error) {
        // if error then making resetPasswordToken and resetPasswordExpire undefined
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        // saving user 
        await user.save({ validateBeforeSave: false });

        res.json({
            message: error.message,
            success: false
        });
    }
}

//! reset password
const resetPassword = async (req, res) => {

    // creating token hash 
    const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

    // finding user based on the token we get from client and the expiry time
    const user = await User.findOne({ resetPasswordToken, resetPasswordExpire: { $gt: Date.now() } });

    // if user not found 
    if (!user) {
        return res.json({
            message: "Reset password token is invalid or has been expired",
            success: false
        });
    }

    // if the password and confirmPassword field not matched 
    if (req.body.password !== req.body.confirmPassword) {
        return res.json({
            message: "Password does not matched",
            success: false
        })
    }

    // changing user password and making resetPasswordToken and resetPasswordExpire undefined
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    // after all changes saving user 
    await user.save();

    // sending token 
    sendToken(user, res, "Password is changed and user Logged in successfully")
}

//! get user details 
const getUserDetails = async (req, res) => {
    try {
        // finding user by id 
        const user = await User.findById(req.user.id);

        // if user not found 
        if (!user) {
            return res.json({
                message: "User not found",
                success: false
            });
        }

        // if user found then sending user to client 
        res.json({
            message: "User found",
            success: true,
            user
        })
    } catch (error) {
        res.json({
            message: error.message,
            success: false
        });
    }
}

//! update user password
const updateUserPassword = async (req, res) => {
    try {
        // finding user by id 
        const user = await User.findById(req.user.id).select("+password");

        // checking for password matched 
        const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

        // if password not matched 
        if (!isPasswordMatched) {
            return res.json({
                message: "Old password is Incorrect",
                success: false
            });
        }

        // if newPassword and confirmPassword not matched 
        if (req.body.newPassword !== req.body.confirmPassword) {
            return res.json({
                message: "new password and confirm password not matched",
                success: false
            });
        }

        // setting users password eqaul to newPassword
        user.password = req.body.newPassword;
        await user.save();

        // sending token to client 
        sendToken(user, res, "Password changed and user Logged in successfully");


    } catch (error) {
        res.json({
            message: error.message,
            success: false
        });
    }
}

//! update user profile 
const updateUserProfile = async (req, res) => {
    try {
        // data to be saved 
        const newUserData = {
            name: req.body.name,
            email: req.body.email
        }

        //we will add cloudinary later

        //finding user by id 
        const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
            new: true,
            runValidators: true
        });

        // if user not found 
        if (!user) {
            return res.json({
                message: "User not found",
                success: false
            })
        }

        // if user found
        res.json({
            message: "User Profile updated successfully",
            success: true
        })
    } catch (error) {
        res.json({
            message: error.message,
            success: false
        });
    }
}

//!get all users --admin
const getAllUsers = async (req, res) => {
    try {
        // finding all the users present in database
        const users = await User.find({});

        // sending the found user data to client 
        res.json({
            message: "Users fetched successfully",
            success: true,
            users
        });

    } catch (error) {
        res.json({
            message: error.message,
            success: false,
        });
    }
}

//! get single user --admin
const getSingleUser = async (req, res) => {
    try {
        // finding user by id 
        const user = await User.findById(req.params.id);

        // if user not found 
        if (!user) {
            return res.json({
                message: "User not found",
                success: false
            });
        }

        // if found then sending user to client 
        res.json({
            message: "User fetched successfully",
            success: true,
            user
        });
    } catch (error) {
        res.json({
            message: error.message,
            success: false,
        });
    }
}

//!update user role -- admin
const updateUserRole = async (req, res) => {
    try {
        //data to be saved
        const newUserData = {
            name: req.body.name,
            email: req.body.email,
            role: req.body.role
        }

        // finding user and updating his data 
        const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
            new: true,
            runValidators: true
        });

        // if user not found 
        if (!user) {
            return res.json({
                message: "User not found",
                success: false
            });
        }

        // if user found
        res.json({
            message: `User role changed to ${req.body.role}`,
            success: true
        });

    } catch (error) {
        res.json({
            message: error.message,
            success: false,
        });
    }
}

//! delete user --admin
const deleteUser = async (req, res) => {
    try {
        // finding user by his id
        const user = await User.findById(req.params.id);

        // we will remove cloudinary later

        // if user not found
        if (!user) {
            return res.json({
                message: "User not found",
                success: false
            });
        }

        // if user found then deleting user 
        await user.deleteOne();

        res.json({
            message: "User deleted successfully",
            success: true
        });

    } catch (error) {
        res.json({
            message: error.message,
            success: false,
        });
    }
}

module.exports = {
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
    deleteUser
};
