const Kyc = require('../models/Kyc');

function computeRiskScore({ creditScore, loanRepaymentHistory, monthlyIncome, outstandingLoans }) {
  // credit risk: map 300–850 → 100–0
  const creditRisk = ((850 - creditScore) / (850 - 300)) * 100;

  // repayment risk: % of missed payments
  const missed = loanRepaymentHistory.filter(x => x === 0).length;
  const repaymentRisk = (missed / loanRepaymentHistory.length) * 100;

  // loan/income risk: cap at 100
  const annualIncome = monthlyIncome * 12 || 1;
  const loanRisk = Math.min((outstandingLoans / annualIncome) * 100, 100);

  // weighted sum
  return Math.round(creditRisk * 0.4 + repaymentRisk * 0.3 + loanRisk * 0.3);
}

// POST /api/kyc
exports.submitKyc = async (req, res) => {
  try {
    const {
      fullName, dob, idNumber, selfieUrl,
      creditScore, loanRepaymentHistory,
      monthlyIncome, outstandingLoans,
      income = 0, expenses = 0
    } = req.body;

    const riskScore = computeRiskScore({
      creditScore, loanRepaymentHistory,
      monthlyIncome, outstandingLoans
    });

    const record = new Kyc({
      fullName,
      dob,
      idNumber,
      selfieUrl,
      creditScore,
      loanRepaymentHistory,
      monthlyIncome,
      outstandingLoans,
      riskScore,
      income,
      expenses
    });

    await record.save();
    return res.status(201).json({ success: true, data: record });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ success: false, error: err.message });
  }
};



// GET /api/kyc
exports.listKycs = async (_, res) => {
  const records = await Kyc.find().sort({ createdAt: -1 });
  res.json({ success: true, data: records });
};

exports.deleteKyc = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Kyc.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Not found' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(400).json({ success: false, error: err.message });
  }
};
