import express, { Request, Response } from "express";
import { body } from "express-validator";
import jwt from "jsonwebtoken";
import { BadRequestError } from "@skctickets/common";
import { User } from "../models/user";
import { validateRequest } from "@skctickets/common";

const router = express.Router();

router.post(
  "/api/users/signup",
  [
    body("email").isEmail().withMessage("Email must be valid"),
    body("password")
      .trim()
      .isLength({ min: 4, max: 20 })
      .withMessage("Password must be between 4 and 20 characters"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    // const errors = validationResult(req);

    // if (!errors.isEmpty()) {
    //   // In plain JS,
    //   // const error = new Error('Invalid email or password');
    //   // error.reasons = errors.array(); // reasons is a madeup property.
    //   // throw error;
    //   // In TS, we cannot do this. So, we will use subclass approach.
    //   throw new RequestValidationError(errors.array());
    // }

    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw new BadRequestError("Email in use");
    }

    const user = User.build({ email, password });
    await user.save();

    // Generate JWT
    const userJWT = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      process.env.JWT_KEY!
    );

    // Store it on session object
    req.session = {
      jwt: userJWT,
    };

    res.status(201).send(user);
  }
);

export { router as signupRouter };
