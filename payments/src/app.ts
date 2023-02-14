import express from "express";
import "express-async-errors";
import { json } from "body-parser";
import cookieSession from "cookie-session";

import { currentUser, errorHandler } from "@skctickets/common";
import { NotFoundError } from "@skctickets/common";
import { createPaymentIntentRouter } from "./routes/new";

const app = express();
app.set("trust proxy", true);
app.use(json());
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== "test",
  })
);

app.use(currentUser);

app.use(createPaymentIntentRouter);

// adding async breaks server
app.all("*", async () => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
