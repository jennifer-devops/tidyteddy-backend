const Stripe = require('stripe');
const dotenv = require('dotenv');

dotenv.config(); 
//create env path
const env = dotenv.config({path: './.env'});

// init Stripe
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// app.use(express.static(process.env.STATIC_DIR));
const createPaymentIntent = async (req, res) => {
  const { amount, receipt_email } = req.body;
  console.log(`Received request to create payment intent with amount: ${amount}`);

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      receipt_email: receipt_email,
      currency: 'aud', 
    });
    if(paymentIntent){
      const paymentMethodType = paymentIntent.payment_method_types[0];
      const paymentIntentId = paymentIntent.id;
      console.log(`Payment intent created with ID: ${paymentIntentId} and payment method type: ${paymentMethodType}`);
    }
    console.log("Payment Intent created successfully:", paymentIntent);
    res.json({ 
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      paymentMethodType: paymentIntent.payment_method_types[0]
     });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).send({ error: error.message });
  }
};

module.exports = { createPaymentIntent };
