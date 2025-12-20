const mongoose = require("mongoose");

async function connectDb() {
  try {
    const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/mina-cafe";
    
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB database");
    
    return mongoose.connection;
  } catch (error) {
    console.error("Unable to connect to the database:", error);
    throw error;
  }
}

module.exports = { connectDb };
