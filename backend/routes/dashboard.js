const router = require('express').Router();
const ctrl   = require('../controllers/dashboardController');

router.get('/metrics', ctrl.getMetrics);
router.get('/trends', ctrl.getTrends);
router.get('/risk-distribution', ctrl.getRiskDistribution);

module.exports = router;
