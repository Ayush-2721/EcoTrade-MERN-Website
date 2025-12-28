const express = require('express')
const router = express.Router()
const PaymentController = require('../controllers/Payment')

router.get('/token', PaymentController.getClientToken)
router.post('/checkout', PaymentController.checkout)

module.exports = router
