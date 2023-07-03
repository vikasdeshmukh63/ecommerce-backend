const Product = require("../models/productModel");

//!create product
const createProduct = async (req, res) => {
    try {
        req.body.user = req.user.id; // assigning user id to the user field in the created product so that we know who created the product

        // checking that is product is already present
        const existingProduct = await Product.findOne({ name: req.body.name });

        // if product is already present
        if (existingProduct) {
            return res.json({
                message: "Product already present",
                success: false,
            });
        }
        // if not then saving one
        const product = new Product(req.body);
        const response = await product.save();

        return res.json({
            message: "Product created successfully",
            success: true,
            response,
        });
    } catch (error) {
        res.json({
            message: error.message,
            success: false,
        });
    }
};

//!get all products
const getAllProducts = async (req, res) => {
    // to get all products
    let query = Product.find({});

    // to get products by category
    if (req.query.category) {
        const categories = Array.isArray(req.query.category) ? req.query.category : [req.query.category];

        query = query.where("category").in(categories);
    }

    // to get products by brand
    if (req.query.brand) {
        const brands = Array.isArray(req.query.brand) ? req.query.brand : [req.query.brand];

        query = query.where("brand").in(brands);
    }

    //to get products by sort
    if (req.query.sort && req.query.order) {
        if (req.query.order === "asc") {
            req.query.order = 1;
        } else if (req.query.order === "desc") {
            req.query.order = -1;
        }

        query = query.sort({ [req.query.sort]: Number(req.query.order) });
    }

    // to get rating above some value
    if (req.query.rating) {
        const rating = Number(req.query.rating);
        query = query.where("rating").gt(rating);
    }

    //to get products by page no
    if (req.query.page && req.query.limit) {
        const limit = Number(req.query.limit);
        const page = Number(req.query.page);
        query = query.skip(limit * (page - 1)).limit(limit);
    }

    try {
        const products = await query.exec();
        // counting the documents after filtering
        const totalCount = await Product.countDocuments(query.getFilter());
        // setting totalCount value to client headers
        res.set("X-Total-Count", totalCount);

        res.json({
            message: "Products fetched successfully",
            success: true,
            products,
            totalCount,
        });
    } catch (error) {
        res.json({
            message: error.message,
            success: false,
        });
    }
};

//!search products
const searchProduct = async (req, res) => {
    try {
        // extracting keyword from query
        const keyword = req.query.keyword;

        // finding the requested product
        const searchProducts = await Product.find({ name: { $regex: new RegExp(`${keyword}`, "i") } });

        // if we dont find any products
        if (searchProducts.length <= 0) {
            return res.json({
                message: "Sorry no results found",
                success: false,
                data: null,
            });
        }

        // sending found product to client
        return res.json({
            message: "Products found",
            success: true,
            searchProducts,
        });
    } catch (error) {
        res.json({
            message: error.message,
            success: false,
        });
    }
};

//! update products
const updateProduct = async (req, res) => {
    try {
        // extracting id from the params
        const id = req.params.id;

        // finding product and updating
        const product = await Product.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

        // if product not found
        if (!product) {
            return res.json({
                message: "no products found with this id",
                success: false,
            });
        }

        // sending found product to client
        return res.json({
            message: "product updated successfully",
            success: true,
            product,
        });
    } catch (error) {
        res.json({
            message: error.message,
            success: false,
        });
    }
};

//! delete products
const deleteProduct = async (req, res) => {
    try {
        // extracting id from the params
        const id = req.params.id;

        // finding and deleting the product
        const product = await Product.findByIdAndDelete(id);

        // if product no found
        if (!product) {
            return res.json({
                message: "no products found with this id",
                success: false,
            });
        }

        // after deleting product
        return res.json({
            message: "product deleted successfully",
            success: true,
        });
    } catch (error) {
        res.json({
            message: error.message,
            success: false,
        });
    }
};

//! get product details
const getProductDetails = async (req, res) => {
    try {
        // finding requested product from database
        const product = await Product.findById(req.params.id);

        // if product not found
        if (!product) {
            return res.json({
                message: "no products found with this id",
                success: false,
            });
        }

        // sending found product to client
        return res.json({
            message: "product fetched successfully",
            success: true,
            product,
        });
    } catch (error) {
        res.json({
            message: error.message,
            success: false,
        });
    }
};

//!create new review or update the existing review
const createProductReview = async (req, res) => {
    try {
        // extracting data from req.body
        const { rating, comment, productId } = req.body;

        // creating review object from the data got from client
        const review = {
            name: req.user.name,
            user: req.user._id,
            rating: Number(rating),
            comment,
        };

        // finding the respected product
        const product = await Product.findById(productId);

        // if product not found
        if (!product) {
            return res.json({
                message: "Product not found",
                success: false,
            });
        }

        // checking that product is already review or not
        const isReviewed = product.reviews.find((rev) => {
            if (rev.user.toString() === req.user._id.toString()) {
                return true;
            } else {
                return false;
            }
        });

        // if already reviewed then editing the existing review
        if (isReviewed) {
            product.reviews.forEach((rev) => {
                if (rev.user.toString() === req.user._id.toString()) {
                    rev.rating = rating;
                    rev.comment = comment;
                }
            });
        }
        // if not then adding new review also updating no. of reviews
        else {
            product.reviews.push(review);
            product.noOfReviews = product.reviews.length;
        }

        // finding average ratings
        let avg = 0;
        product.reviews.forEach((rev) => {
            avg += rev.rating;
        });

        product.ratings = avg / product.reviews.length;

        // saving all the changes in the product
        await product.save();

        res.json({
            message: "Review Added",
            success: true,
        });
    } catch (error) {
        res.json({
            message: error.message,
            success: false,
        });
    }
};

//! get product reviews
const getProductReviews = async (req, res) => {
    try {
        // finding product
        const product = await Product.findById(req.query.productId);

        // if product not found
        if (!product) {
            return res.json({
                message: "Product not found",
                success: false,
            });
        }
        // if found then sending the review of it to client
        res.json({
            message: "Reviews fetched successfully",
            success: true,
            reviews: product.reviews,
        });
    } catch (error) {
        res.json({
            message: error.message,
            success: false,
        });
    }
};

//! delete product reviews
const deleteProductReview = async (req, res) => {
    try {
        //finding product by id
        const product = await Product.findById(req.query.productId);

        //if product not found
        if (!product) {
            return res.json({
                message: "Product not found",
                success: false,
            });
        }

        // filtering review based on id and saving which id is different from the review we want to delete
        const reviews = product.reviews.filter((rev) => {
            console.log(rev.id.toString(),req.query.id)
            return rev._id.toString() !== req.query.id.toString();
        });

         // setting up updated average rating
         let avg = 0;
         let ratings = 0;
         if (reviews.length > 0) {
             reviews.forEach((rev) => {
                 avg += rev.rating;
             });
             ratings = avg / reviews.length;
         }
 
        //setting up no. of reviews
        const noOfReviews = reviews.length;

        //updating product changes
        await Product.findByIdAndUpdate(
            req.query.productId,
            {
                reviews,
                ratings,
                noOfReviews,
            },
            {
                new: true,
                runValidators: true,
            }
        );

        await product.save({
            validateBeforeSave: true,
        });

        res.json({
            message: "Review deleted",
            success: true,
        });

    } catch (error) {
        res.json({
            message: error.message,
            success: false,
        });
    }
};

module.exports = {
    createProduct,
    getAllProducts,
    searchProduct,
    updateProduct,
    deleteProduct,
    getProductDetails,
    createProductReview,
    getProductReviews,
    deleteProductReview,
};
