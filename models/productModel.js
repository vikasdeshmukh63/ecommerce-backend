const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter product name"],
        trim: true,
        unique:true
    },
    description: {
        type: String,
        required: [true, "Please enter description"],
    },
    price: {
        type: Number,
        required: [true, "Please enter price"],
        maxLength: [10, "price should not exceed more than 10 characters"],
    },
    rating: {
        type: Number,
        default: 0,
    },
    images: [
        {
            public_id: {
                type: String,
                required: true,
            },
            url: {
                type: String,
                required: true,
            },
        },
    ],
    category: {
        type: String,
        required: [true, "Please enter product category"]
    },
    brand: {
        type: String,
        required: [true, "Please enter product brand"]
    },
    stock: {
        type: Number,
        required: [true, "Please enter product stock"],
        max: [4, "stock cannot exceed more than 4 characters"],
        default: 1
    },
    noOfReviews: {
        type: Number,
        default: 0
    },
    reviews: [
        {
            name: {
                type: String,
                required: true
            },
            rating: {
                type: Number,
                required: true
            },
            comment: {
                type: String,
                required: true
            }
        }
    ],
    user:{
        type:mongoose.Schema.ObjectId,
        ref:"User",
        required:true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});


module.exports = mongoose.model("Product", productSchema);