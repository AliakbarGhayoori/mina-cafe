require("dotenv").config();
const mongoose = require("mongoose");
const { connectDb } = require("../src/config/database");
const { Admin } = require("../src/models");

async function createAdmin() {
  try {
    // Connect to database
    await connectDb();
    console.log("Connected to MongoDB database");

    const email = "kamiyar.heidarnezhad@gmail.com";
    const password = "123456";
    const name = "Kamiyar Heidarnezhad";

    // Check if admin already exists
    const existing = await Admin.findOne({ email });
    if (existing) {
      console.log("Admin already exists with this email");
      await mongoose.connection.close();
      return;
    }

    // Create admin (password will be hashed by pre('save') hook)
    const admin = await Admin.create({
      email,
      password,
      name,
    });

    console.log("Admin created successfully!");
    console.log("Email:", admin.email);
    console.log("Name:", admin.name);
    console.log("ID:", admin.id);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Error creating admin:", error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

createAdmin();
