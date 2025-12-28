const braintree = require('braintree')
require('dotenv').config()
const Payment = require('../models/Payment')

const gateway = new braintree.BraintreeGateway({
	environment: braintree.Environment.Sandbox,
	merchantId: process.env.BRAINTREE_MERCHANT_ID,
	publicKey: process.env.BRAINTREE_PUBLIC_KEY,
	privateKey: process.env.BRAINTREE_PRIVATE_KEY,
})

exports.getClientToken = async (req, res) => {
	try {
		const response = await gateway.clientToken.generate({})
		res.status(200).json({ clientToken: response.clientToken })
	} catch (error) {
		console.error('Error generating braintree client token', error)
		res.status(500).json({ message: 'Error generating client token' })
	}
}

exports.checkout = async (req, res) => {
	try {
		const { paymentMethodNonce, amount, user, order } = req.body
		if (!paymentMethodNonce || !amount) return res.status(400).json({ message: 'Missing payment nonce or amount' })

		const saleRequest = {
			amount: amount.toString(),
			paymentMethodNonce,
			options: { submitForSettlement: true }
		}

		gateway.transaction.sale(saleRequest, async function (err, result) {
			if (err) {
				console.error('Braintree transaction error', err)
				return res.status(500).json({ message: 'Payment processing failed' })
			}
			if (result && result.success) {
				// persist payment
				try {
					const paymentDoc = new Payment({
						user: user || null,
						order: order || null,
						transactionId: result.transaction.id,
						amount: parseFloat(result.transaction.amount),
						currency: result.transaction.currencyIsoCode || 'USD',
						status: result.transaction.status,
						method: result.transaction.paymentInstrumentType || '',
						raw: result
					})
					await paymentDoc.save()
				} catch (saveErr) {
					console.error('Error saving payment record', saveErr)
				}
				return res.status(200).json({ success: true, transaction: result.transaction })
			}
			console.error('Braintree transaction failed', result)
			return res.status(400).json({ success: false, result })
		})

	} catch (error) {
		console.error(error)
		res.status(500).json({ message: 'Error processing payment' })
	}
}

