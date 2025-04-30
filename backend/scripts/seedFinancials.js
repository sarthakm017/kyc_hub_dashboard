
require('dotenv').config({ path: __dirname + '/../.env' });

const mongoose  = require('mongoose');
const connectDB = require('../config/db');
const Kyc       = require('../models/Kyc');

(async () => {
  try {
    // 2) Connect to MongoDB
    await connectDB();

    // 3) Fetch and update each document
    const docs = await Kyc.find();
    for (let d of docs) {
      d.riskScore = Math.floor(Math.random() * 101);
      d.income    = Math.floor(Math.random() * 100000);
      d.expenses  = Math.floor(Math.random() * 80000);
      await d.save();
    }

    console.log('✅ Seeded financial fields');
  } catch (err) {
    console.error('Seeding error:', err);
  } finally {
    // 4) Exit cleanly
    mongoose.disconnect();
  }
})();
