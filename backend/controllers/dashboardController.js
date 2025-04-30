const Kyc = require('../models/Kyc');
const mongoose = require('mongoose');

exports.getMetrics = async (_, res) => {
  // 1) total customers
  const totalCustomers = await Kyc.countDocuments();

  // 2) average riskScore
  const [{ avgRiskScore = 0 }] = await Kyc.aggregate([
    { $group: { _id: null, avgRiskScore: { $avg: '$riskScore' } } }
  ]);

  // 3) total income & expenses
  const [{ totalIncome = 0, totalExpenses = 0 }] = await Kyc.aggregate([
    {
      $group: {
        _id: null,
        totalIncome:   { $sum: '$income' },
        totalExpenses: { $sum: '$expenses' }
      }
    }
  ]);

  res.json({
    success: true,
    data: { totalCustomers, avgRiskScore, totalIncome, totalExpenses }
  });
};

exports.getTrends = async (_, res) => {
  // group by date (YYYY-MM-DD) on createdAt
  const data = await Kyc.aggregate([
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        income:   { $sum: '$income' },
        expenses: { $sum: '$expenses' }
      }
    },
    { $sort: { '_id': 1 } },
    { $project: { date: '$_id', income: 1, expenses: 1, _id: 0 } }
  ]);
  res.json({ success: true, data });
};

exports.getRiskDistribution = async (_, res) => {
  // bucket riskScore into 4 ranges
  const data = await Kyc.aggregate([
    {
      $bucket: {
        groupBy: '$riskScore',
        boundaries: [0, 25, 50, 75, 101],
        default: 'Unknown',
        output: { count: { $sum: 1 } }
      }
    },
    {
      $project: {
        range: {
          $switch: {
            branches: [
              { case: { $eq: ['$_id', 0] }, then: '0-25' },
              { case: { $eq: ['$_id', 25] }, then: '26-50' },
              { case: { $eq: ['$_id', 50] }, then: '51-75' },
              { case: { $eq: ['$_id', 75] }, then: '76-100' }
            ],
            default: 'Unknown'
          }
        },
        count: '$count'
      }
    }
  ]);
  res.json({ success: true, data });
};
