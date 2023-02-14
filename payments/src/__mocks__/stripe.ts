import mongoose from "mongoose";

export const stripe = {
  paymentIntents: {
    create: jest.fn().mockImplementation(() => {
      return Promise.resolve({
        id: new mongoose.Types.ObjectId().toHexString(),
      });
    }),
  },
};
