import {
  BadRequestError,
  NotAuthorizedError,
  NotFoundError,
  OrderStatus,
  requireAuth,
  validateRequest,
} from "@skctickets/common";
import express, { Request, Response } from "express";
import { body } from "express-validator";
import Stripe from "stripe";
import { PaymentCreatedPublisher } from "../events/publisher/payment-created-publisher";
import { Order } from "../models/order";
import { Payment } from "../models/payment";
import { natsWrapper } from "../nats-wrapper";
import { stripe } from "../stripe";

const router = express.Router();

const generateResponse = (
  intent: Stripe.Response<Stripe.PaymentIntent> | undefined
) => {
  // Note that if your API version is before 2019-02-11, 'requires_action'
  // appears as 'requires_source_action'.
  if (
    intent!.status === "requires_action" &&
    intent!.next_action!.type === "use_stripe_sdk"
  ) {
    // Tell the client to handle the action
    return {
      requires_action: true,
      payment_intent_client_secret: intent!.client_secret,
    };
  } else if (intent!.status === "succeeded") {
    // The payment didn’t need any additional actions and completed!
    // Handle post-payment fulfillment

    return {
      success: true,
    };
  } else {
    // Invalid status
    return {
      error: "Invalid PaymentIntent status",
    };
  }
};

router.post(
  "/api/payments",
  requireAuth,
  [body("orderId").not().isEmpty()],
  validateRequest,
  async (request: Request, response: Response) => {
    const order = await Order.findById(request.body.orderId);

    if (!order) {
      throw new NotFoundError();
    }

    if (order.userId !== request.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    if (order.status === OrderStatus.Cancelled) {
      throw new BadRequestError("Cannot pay for an cancelled order");
    }

    let intent;
    if (request.body.payment_method_id) {
      // Create the PaymentIntent
      intent = await stripe.paymentIntents.create({
        payment_method: request.body.payment_method_id,
        amount: order.price * 100,
        currency: "inr",
        confirmation_method: "manual",
        confirm: true,
      });
    } else if (request.body.payment_intent_id) {
      intent = await stripe.paymentIntents.confirm(
        request.body.payment_intent_id
      );
    }
    // Send the response to the client
    response.send(generateResponse(intent));

    // const paymentIntent = await stripe.paymentIntents.create({
    //   amount: order.price * 100,
    //   currency: "inr",
    //   payment_method_types: ["card"],
    //   payment_method: paymentMethod.id,
    //   metadata: { order_id: orderId },
    // });

    // const confirmPayment = await stripe.paymentIntents.confirm(
    //   paymentIntent.id,
    //   {
    //     payment_method: paymentMethod.id,
    //   }
    // );

    // console.log(confirmPayment);

    // const payment = Payment.build({
    //   orderId,
    //   stripeId: paymentIntent.id,
    // });
    // await payment.save();

    // new PaymentCreatedPublisher(natsWrapper.client).publish({
    //   id: payment.id,
    //   orderId: payment.orderId,
    //   stripeId: payment.stripeId,
    // });

    // res.status(201).send(paymentIntent);
  }
);

export { router as createPaymentIntentRouter };
