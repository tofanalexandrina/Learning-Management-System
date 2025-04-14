const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

//connecting to MongoDB
const MONGO_URL = process.env.MONGO_URL;

const ADMIN_ID = uuidv4();
const ADMIN_EMAIL=process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD=process.env.ADMIN_PASSWORD;

async function seedAdmin() {
  try {
    await mongoose.connect(MONGO_URL);
    console.log('Connected to MongoDB...');

    const Admin = require('../models/Admin');

    const existingAdmin = await Admin.findOne({ adminEmail: ADMIN_EMAIL });

    if (existingAdmin) {
      console.log('Admin user already exists');
    } else {
      //hashing password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);
      
      //creating admin user
      const admin = new Admin({
        adminId: ADMIN_ID,
        adminEmail: ADMIN_EMAIL,
        password: hashedPassword,
        role: 3
      });

      //saving to database
      await admin.save();
      console.log('Admin user created successfully');
      console.log(`Email: ${ADMIN_EMAIL}`);
      console.log(`Password: ${ADMIN_PASSWORD} (stored as hashed)`);
    }
    
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    
  } catch (error) {
    console.error('Error seeding admin:', error);
  }
}

seedAdmin();