const mongoose = require('mongoose');
const { MONGO_URI } = process.env;

module.exports = function connectDB() {
  return mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
};
