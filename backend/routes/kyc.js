const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/kycController');

router.post('/', ctrl.submitKyc);
router.get('/',  ctrl.listKycs);
router.delete('/:id', ctrl.deleteKyc);

module.exports = router;
