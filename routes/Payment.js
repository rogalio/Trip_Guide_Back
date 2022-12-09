const isAuth = require("./IsAuthenticated").isAuth;

require("dotenv").config();
const router = require("express").Router();

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2022-08-01",
});

router.get("/config", (req, res) => {
  res.send({
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  });
});

router.post("/hotel/pay", async (req, res) => {
  try {
    let { amount } = req.body;
    amount = amount * 100;
    const payment = await stripe.paymentIntents.create({
      amount,
      currency: "EUR",
    });
    res.status(200).json({
      message: "Payment successful",
      clientSecret: payment.client_secret,
      success: true,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      message: "Server error",
      success: false,
    });
  }
});

router.post("/flight/pay",  async (req, res) => {
  try {
    let { amount } = req.body;
    amount = amount * 100;
    const payment = await stripe.paymentIntents.create({
      amount,
      currency: "EUR",
    });
    res.status(200).json({
      message: "Payment successful",
      clientSecret: payment.client_secret,
      success: true,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      message: "Server error",
      success: false,
    });
  }
});

module.exports = router;
