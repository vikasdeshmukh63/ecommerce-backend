const Order = require("../models/orderModel");
const Product = require("../models/productModel");

//! Creating New Order
const newOrder = async (req, res) => {
    try {
        // receiving data from client in variables 
        const {
            shippingInfo,
            orderItems,
            paymentInfo,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice
        } = req.body;

        // creating new order 
        const order = await Order.create({
            shippingInfo,
            orderItems,
            paymentInfo,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice,
            paidAt: Date.now(),
            user: req.user._id
        });

        // sending order to client 
        res.json({
            message: "Order Placed",
            success: true,
            order
        });

    } catch (error) {
        res.json({
            message: error.message,
            success: false
        });
    }
}


//! Get Single Order
const getSingleOrder = async (req, res) => {
    try {
        // finding order by id 
        const order = await Order.findById(req.params.id).populate("user", "name email");

        // if order not found 
        if (!order) {
            return res.json({
                message: "Order not found",
                success: false
            });
        }

        // if found then sending it to client 
        res.json({
            message: "Order fetched successfully",
            success: true,
            order
        });

    } catch (error) {
        res.json({
            message: error.message,
            success: false
        });
    }
}

//! Get LoggedIn Users Orders
const myOrders = async (req, res) => {
    try {
        //  finding order by user id 
        const orders = await Order.find({ user: req.user._id });

        // if orders not found 
        if (!orders) {
            return res.json({
                message: "No Orders found",
                success: false
            })
        }

        // if found then sending orders to client 
        res.json({
            message: "Orders fetched successfully",
            success: true,
            orders
        });

    } catch (error) {
        res.json({
            message: error.message,
            success: false
        });
    }
}

//! Get All Orders --admin
const getAllOrders = async (req, res) => {
    try {
        // finding orders
        const orders = await Order.find();

        // if orders not found 
        if (!orders) {
            return res.json({
                message: "Orders not found",
                success: false
            });
        }

        // calculating totalAmount
        let totalAmount = 0;

        orders.forEach((order) => {
            totalAmount += order.totalPrice
        })

        // if found then sending to client 
        res.json({
            message: "Orders fetched successfully",
            success: true,
            orders,
            totalAmount
        })
    } catch (error) {
        res.json({
            message: error.message,
            success: false
        });
    }
}


//! Update Order Status --admin
const updateOrderStatus = async (req, res) => {
    try {
        // finding order
        const order = await Order.findById(req.params.id);

        // if order not found 
        if (!order) {
            return res.json({
                message: "Order not found",
                success: false
            });
        }

        // if orderStatus is already delivered then we cannot change its status 
        if (order.orderStatus === "Delivered") {
            return res.json({
                message: "You have already delivered this order"
            });
        }

        // reducing stock of the respective product after order 
        order.orderItems.forEach(async (item) => {
            await updateStock(item.product, item.quantity)
        })

        // changing order status 
        order.orderStatus = req.body.status;

        // setting delivery date only when the order is delivered 
        if (req.body.status === "Delivered") {
            order.deliveredAt = Date.now()
        }

        // saving product 
        await order.save({
            validateBeforeSave: false
        });

        res.json({
            message:`Order Status Updated To ${req.body.status}`,
            success:true
        });

    } catch (error) {
        res.json({
            message: error.message,
            success: false
        });
    }
}

//! function to update the stock of product 
async function updateStock(productId, quantity) {
    // finding respective product with id 
    const product = await Product.findById(productId);
    // reducing stock 
    product.stock -= quantity;
    // saving product 
    await product.save({
        validateBeforeSave: false
    });
}


//! Delete order --admin
const deleteOrder = async (req, res) => {
    try {
        // finding order
        const order = await Order.findById(req.params.id);

        // if order not found 
        if (!order) {
            return res.json({
                message: "Order not found",
                success: false
            });
        }

        // deleting order 
        await order.deleteOne();

        res.json({
            message:"Order Deleted Successfully",
            success:true
        });

    } catch (error) {
        res.json({
            message: error.message,
            success: false
        });
    }
}

module.exports = {
    newOrder,
    getSingleOrder,
    myOrders,
    getAllOrders,
    updateOrderStatus,
    deleteOrder
}