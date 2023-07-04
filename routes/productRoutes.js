const router = require("express").Router();
const { getAllProducts, createProduct, searchProduct, updateProduct, deleteProduct, getProductDetails } = require("../controllers/productController");
const { isAuthenticatedUser, authorizedRoles } = require("../middleware/auth");


// create product route -- admin
router.route("/admin/product/new").post(isAuthenticatedUser, authorizedRoles("admin"), createProduct);

//get all products route
router.route("/products").get(getAllProducts);

//search products route
router.route("/products/search").get(searchProduct);

//update -- admin,delete -- admin
router.route("/admin/product/:id")
    .patch(isAuthenticatedUser, authorizedRoles("admin"), updateProduct)
    .delete(isAuthenticatedUser, authorizedRoles("admin"), deleteProduct);

// get product details route 
router.route("/product/:id").get(getProductDetails);

module.exports = router;