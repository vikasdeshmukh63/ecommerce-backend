const mongoose = require("mongoose");

function dbConnect() {
  mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const db = mongoose.connection;

  db.on("connected", () => {
    console.log("Connected to MongoDB database");
  });

  db.on("error", (error) => {
    console.error("Database connection error:", error);
  });

  db.on("disconnected", () => {
    console.log("Disconnected from MongoDB database");
  });

  process.on("SIGINT", () => {
    db.close(() => {
      console.log("Database connection closed due to application termination");
      process.exit(0);
    });
  });
}

module.exports = dbConnect;


