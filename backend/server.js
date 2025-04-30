require('dotenv').config();
const express   = require('express');
const cors      = require('cors');
const connectDB = require('./config/db');
const kycRoutes = require('./routes/kyc');

const app = express();
app.use(cors());
app.use(express.json());

connectDB()
  .then(() => console.log('🗄️  MongoDB connected'))
  .catch(err => console.error('DB error:', err));

app.use('/api/kyc', kycRoutes);

const dashboardRoutes = require('./routes/dashboard');
app.use('/api/dashboard', dashboardRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
