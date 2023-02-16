import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "../../components/checkoutForm";
import Router from "next/router";

const OrderShow = ({ order }) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const [paymetCompleted, setPaymentCompleted] = useState(false);
  const stripeTestPromise = loadStripe(
    "pk_test_51MbBYzSCz60QP3cG3g0P0a0214qi41VOG16Si4o3KkQBNhcX3lX0M7apTbzf9BhfpdmaoSZhicSkjnZ6Kt05B1hH005bWAQCDO"
  );

  useEffect(() => {
    const findTimeLeft = () => {
      const msLeft = new Date(order.expiresAt) - new Date();
      setTimeLeft(Math.round(msLeft / 1000));
    };

    findTimeLeft();
    const timerId = setInterval(findTimeLeft, 1000);

    return () => {
      clearInterval(timerId);
    };
  }, [order]);

  if (timeLeft < 0) {
    return <div>Order Expired</div>;
  }

  return (
    <div>
      {paymetCompleted ? (
        <div className="alert alert-success my-3">
          <h5>Payment Successfull! Your Ticket has been booked.</h5>
          <button className="btn btn-success" onClick={() => Router.push("/")}>
            Back To Orders
          </button>
        </div>
      ) : (
        <div>
          Time left to pay: <span className="badge bg-danger">{timeLeft}</span>{" "}
          seconds
          <Elements stripe={stripeTestPromise}>
            <CheckoutForm
              orderId={order.id}
              setPaymentCompleted={setPaymentCompleted}
            />
          </Elements>
        </div>
      )}
    </div>
  );
};

OrderShow.getInitialProps = async (context, client) => {
  const { orderId } = context.query;
  const { data } = await client.get(`/api/orders/${orderId}`);

  return { order: data };
};
export default OrderShow;
