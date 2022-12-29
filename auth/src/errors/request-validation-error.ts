import { ValidationError } from "express-validator";

export class RequestValidationError extends Error {
  //private errors is equivalent to declaring error outside of constructor
  // and assigning values to its properties using this keyword.

  constructor(public errors: ValidationError[]) {
    super();

    // Only because we are extending a built in class
    Object.setPrototypeOf(this, RequestValidationError.prototype);
  }
}
