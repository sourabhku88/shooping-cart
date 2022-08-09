const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;
const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: ObjectId,
      ref: "user",
      required: true,
      unique: true,
    },

    items: [
      {
        productId: {
          type: ObjectId,
          ref: "product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
      },
    ],
    totalPrice: {
      type: Number,
      required: true,
      //Holds total price of all the items in the cart
    },
    totalItems: {
      type: Number,
      //Holds total number of items in the cart
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("cart", cartSchema);
