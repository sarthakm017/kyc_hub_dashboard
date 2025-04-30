const mongoose = require('mongoose');

 const KycSchema = new mongoose.Schema({
  fullName:            { type: String, required: true },
  dob:                 { type: Date,   required: true },
  idNumber:            { type: String, required: true, unique: true },
  selfieUrl:           { type: String, required: true },
  monthlyIncome:       { type: Number, required: true, default: 0 },
  outstandingLoans:    { type: Number, required: true, default: 0 },
  creditScore:         { type: Number, required: true, default: 0 },
  loanRepaymentHistory:{ type: [Number], required: true, default: [] },
  riskScore:           { type: Number, default: 0 },
  income:              { type: Number, default: 0 },
  expenses:            { type: Number, default: 0 },
  createdAt:           { type: Date,   default: Date.now }
});


module.exports = mongoose.model('Kyc', KycSchema);
