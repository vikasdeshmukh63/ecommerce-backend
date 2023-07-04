const router = require("express").Router();
const { newOrder, getSingleOrder, myOrders, getAllOrders, updateOrderStatus, deleteOrder } = require("../controllers/orderController");
const { isAuthenticatedUser, authorizedRoles } = require("../middleware/auth");

// new order route
router.route("/order/new").post(isAuthenticatedUser, newOrder);

// get single users order route
router.route("/order/:id").get(isAuthenticatedUser, getSingleOrder);

// get loggedIn users orders
router.route("/orders/me").get(isAuthenticatedUser, myOrders);

// get all orders route --admin
router.route("/admin/orders").get(isAuthenticatedUser, authorizedRoles("admin"), getAllOrders);

// update order status and delete order route --admin
router
    .route("/admin/order/:id")
    .put(isAuthenticatedUser, authorizedRoles("admin"), updateOrderStatus)
    .delete(isAuthenticatedUser, authorizedRoles("admin"), deleteOrder);

module.exports = router;
