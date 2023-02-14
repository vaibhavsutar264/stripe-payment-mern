import express from "express";
import User from "../models/user";
import Article from "../models/article";
import { checkAuth } from "../middleware/checkAuth";
import { stripe } from "../utils/stripe";

const router = express.Router();

router.get("/prices", checkAuth, async (req, res) => {
  const prices = await stripe.prices.list({
    apiKey: process.env.STRIPE_SECRET_KEY,
  });

 console.log('====================================');
 console.log(prices);
 console.log('====================================');
  return res.json(prices);
});

router.post("/session", async (req, res) => {
  const user = await User.findOne({ email: req.user });
  console.log('====================================');
  console.log(req.body.price);
  console.log('====================================');

  const customer = await stripe.customers.create(
    {
      email:'abc@gmail.com',
    },
    {
      apiKey: process.env.STRIPE_SECRET_KEY,
    }
  );

  console.log('====================================');
  console.log(customer);
  console.log('====================================');
  // await stripe.customers.update(
  //   'price_1MZEt8SHR0RldS5SFuVbbSCC',
  //   {currency: "usd"}
  // );

  // const invoiceItem = await stripe.invoiceItems.create({
  //   customer: 'price_1MZEt8SHR0RldS5SFuVbbSCC',
  //   amount:200000
  //   currency: 'usd',
  // });

  const session = await stripe.checkout.sessions.create(
    {
      mode: "subscription",
      payment_method_types: ["card"],
      discounts:[
        {
          coupon:'mIIb2i8o'
        }
      ],
      line_items: [
        {
          // price: req.body.priceId,
          quantity: 1,
          // amount:2000,
          // currency:'inr',
          // name:'vaibhav sutar'
          price_data: {
            product_data: {
              name: 'my plan',
            },
            currency: "inr",
            unit_amount: req.body.price*100,
            recurring: {
              interval: "month",
            },
          },
          // price_data: {
          //   unit_amount: 500,
          //   currency: 'USD',
          //   // quantity: 1,
          // },
          // recurring: {
          //   interval: "month",
          // },
        },
      ],
      subscription_data : {
        trial_period_days:1
      },
      success_url: "http://localhost:3000/articles",
      cancel_url: "http://localhost:3000/article-plans",
      customer: customer.id,
    },
    {
      apiKey: process.env.STRIPE_SECRET_KEY,
    },
  );

  return res.json(session);
});

export default router;
