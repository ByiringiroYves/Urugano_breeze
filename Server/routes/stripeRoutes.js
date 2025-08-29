const express = require('express');
const router = express.Router();
const { handleStripeWebhook } = require('../stripe/stripeWebhook');

// Stripe Webhook route - must be before `express.json()`
router.post('/stripe-webhook', handleStripeWebhook);


module.exports = router;


