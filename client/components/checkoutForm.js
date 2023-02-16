import React, { useState } from "react";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import useRequest from "../hooks/use-request";

export default function CheckoutForm({ orderId, setPaymentCompleted }) {
  const stripe = useStripe();
  const elements = useElements();

  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState();

  const { doRequest, errors } = useRequest({
    url: "/api/payments",
    method: "post",
    body: {
      orderId,
    },
    onSuccess: (res) => {
      return res;
    },
  });

  const handleServerResponse = async (response) => {
    if (response.message) {
      // Show error from server on payment form
      setProcessing(false);
    } else if (response.requires_action) {
      // Use Stripe.js to handle the required card action
      const { error: errorAction, paymentIntent } =
        await stripe.handleCardAction(response.payment_intent_client_secret);

      if (errorAction) {
        // Show error from Stripe.js in payment form
        setError(errorAction.message);
        setProcessing(false);
      } else {
        // The card action has been handled
        // The PaymentIntent can be confirmed again on the server
        const res = await doRequest({ payment_intent_id: paymentIntent.id });
        handleServerResponse(res);
      }
    } else {
      // Show success message
      setPaymentCompleted(true);
    }
  };

  const stripePaymentMethodHandler = async (result) => {
    if (result.error) {
      // Show error in payment form
      setError(result.error.message);
      setProcessing(false);
    } else {
      // Otherwise send paymentMethod.id to server
      const res = await doRequest({
        payment_method_id: result.paymentMethod.id,
      });

      // Handle server response
      handleServerResponse(res);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }

    setProcessing(true);
    setError();

    const result = await stripe.createPaymentMethod({
      type: "card",
      card: elements.getElement(CardElement),
    });

    stripePaymentMethodHandler(result);
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardElement options={{ hidePostalCode: true }} />
      <button type="submit" disabled={!stripe} className="btn btn-primary my-3">
        {processing ? "Processing.." : "Pay Now"}
      </button>
      {errors}
      {error && (
        <div className="alert alert-danger">
          <h5>{error}</h5>
        </div>
      )}
    </form>
  );
}

// import { PaymentElement } from "@stripe/react-stripe-js";
// import { useState } from "react";
// import { useStripe, useElements } from "@stripe/react-stripe-js";

// const CheckoutForm = () => {
//   const stripe = useStripe();
//   const elements = useElements();

//   const [message, setMessage] = useState(null);
//   const [isProcessing, setIsProcessing] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!stripe || !elements) {
//       // Stripe.js has not yet loaded.
//       // Make sure to disable form submission until Stripe.js has loaded.
//       return;
//     }

//     setIsProcessing(true);

//     const { error } = await stripe.confirmPayment({
//       elements,
//       confirmParams: {
//         // Make sure to change this to your payment completion page
//         return_url: `${window.location.origin}/payment_success`,
//       },
//     });

//     if (error.type === "card_error" || error.type === "validation_error") {
//       setMessage(error.message);
//     } else {
//       setMessage("An unexpected error occured.");
//     }

//     setIsProcessing(false);
//   };

//   return (
//     <form onSubmit={handleSubmit}>
//       <PaymentElement />
//       <button
//         disabled={isProcessing || !stripe || !elements}
//         className="btn btn-primary my-3"
//       >
//         <span>{isProcessing ? "Processing ... " : "Pay now"}</span>
//       </button>
//       {/* Show any error or success messages */}
//       {message && <div className="alert alert-danger">{message}</div>}
//     </form>
//   );
// };

// export default CheckoutForm;
