const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter your name"],
        trim: true,
        maxLength: [30, "Name cannot exceed more than 30 characters"],
        minLength: [4, "Name should have more than 5 characters"]
    },
    email: {
        type: String,
        required: [true, "Please Enter your Email"],
        trim: true,
        validate: [validator.isEmail, "Please Enter valid email"],
    },
    password: {
        type: String,
        required: [true, "Please Enter your password"],
        minLength: [8, "Password should be more than 8 characters"],
        select: false, //whenever we called find method then we should not get password
    },
    avatar: {
        public_id: {
            type: String,
            required: true
        },
        url: {
            type: String,
            required: true
        }
    },
    role: {
        type: String,
        default: "user"
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date
});

// to avoid the hashing of password again when password is not changed while we update the userInfo
userSchema.pre("save", async function (next) {
    // if password is not modified 
    if (!this.isModified("password")) {
        next()
    }
    //if password is modified then hashing new password
    this.password = await bcrypt.hash(this.password, 10)
});

// jwt token 
userSchema.methods.getJwtToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });
}

// compare password
userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
}

// generating forgot password token 
userSchema.methods.getResetPasswordToken = function () {

    //generating token 
    const resetToken = crypto.randomBytes(20).toString("hex");

    // hashing and adding to resetPasswordToken to userSchema
    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    // setting expiry time for token 
    this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

    return resetToken;
}


module.exports = mongoose.model("User", userSchema);