const dotenv = require("dotenv").config()
const express = require("express");
const app = express();
const dbConnect = require("./config/dbConfig")
const productRoutes = require("./routes/productRoutes");
const userRoutes = require("./routes/userRoutes");
const orderRoutes = require("./routes/orderRoutes");
const cookieParser = require("cookie-parser");

// handling uncaught exception 
process.on("uncaughtException", (err) => {
    console.log(`Error: ${err.message}`);
    console.log("Shutting down the server due to Uncaught Exception");

    process.exit(1);
});

//connecting to mongodb server 
dbConnect();

// middleware 
app.use(express.json());
app.use(cookieParser());

// routes 
app.use("/api/v1", productRoutes);
app.use("/api/v1",userRoutes);
app.use("/api/v1",orderRoutes);


const server = app.listen(process.env.PORT, () => {
    console.log(`Server has started on port ${process.env.PORT}`)
});


//unhandled promise rejection (if the mongodb server link is inappropriate then we close the sever intentionally)
process.on("unhandledRejection", (err) => {
    console.log(`Error: ${err.message}`);
    console.log("Shutting down the server due to Unhandled Promise Rejection");

    server.close(() => {
        process.exit(1)
    });
});