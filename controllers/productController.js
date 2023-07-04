const Product = require("../models/productModel");

//!create product
const createProduct = async (req, res) => {
    try {
        req.body.user = req.user.id // assigning user id to the user field in the created product so that we know who created the product

        // checking that is product is already present 
        const existingProduct = await Product.findOne({ name: req.body.name });

        // if product is already present 
        if (existingProduct) {
            return res.json({
                message: "Product already present",
                success: false
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
            success: false
        });
    }
}


//!get all products
const getAllProducts = async (req, res) => {
    // to get all products
    let query = Product.find({});

    // to get products by category
    if (req.query.category) {
        const categories = Array.isArray(req.query.category)
            ? req.query.category
            : [req.query.category];

        query = query.where("category").in(categories);
    }

    // to get products by brand
    if (req.query.brand) {
        const brands = Array.isArray(req.query.brand)
            ? req.query.brand
            : [req.query.brand];

        query = query.where("brand").in(brands);
    }

    //to get products by sort
    if (req.query.sort && req.query.order) {
        if (req.query.order === "asc") {
            req.query.order = 1
        }
        else if (req.query.order === "desc") {
            req.query.order = -1
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
            success: false,
            products,
            totalCount
        });

    } catch (error) {
        res.json({
            message: error.message,
            success: false
        });
    }
}

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
                data: null
            });
        }

        // sending found product to client 
        return res.json({
            message: "Products found",
            success: true,
            searchProducts
        });

    } catch (error) {
        res.json({
            message: error.message,
            success: false
        });
    }
}

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
                success: false
            });
        }

        // sending found product to client 
        return res.json({
            message: "product updated successfully",
            success: true,
            product
        });

    } catch (error) {
        res.json({
            message: error.message,
            success: false
        });
    }
}


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
                success: false
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
            success: false
        });
    }
}

//! get product details
const getProductDetails = async (req, res) => {
    try {
        // finding requested product from database 
        const product = await Product.findById(req.params.id);

        // if product not found 
        if (!product) {
            return res.json({
                message: "no products found with this id",
                success: false
            });
        }

        // sending found product to client 
        return res.json({
            message: "product fetched successfully",
            success: true,
            product
        });

    } catch (error) {
        res.json({
            message: error.message,
            success: false
        });
    }
}

module.exports = {
    createProduct,
    getAllProducts,
    searchProduct,
    updateProduct,
    deleteProduct,
    getProductDetails
}