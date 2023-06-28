const jwt = require("jsonwebtoken");
const User = require("../models/userModel");


const isAuthenticatedUser = async (req, res, next) => {
    const { token } = req.cookies;

    if (!token) {
        return res.json({
            message: "Please login to access this resource",
            success: false
        });
    }

    const decodedData = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decodedData.id);

    next()
}

const authorizedRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            res.json({
                message: "you are not authorized to access this resource",
                success: false
            })
        }
        next();
    }
}

module.exports={
    isAuthenticatedUser,
    authorizedRoles
}