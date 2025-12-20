const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    titleEn: {
      type: String,
      required: true,
    },
    titleFa: {
      type: String,
      required: true,
    },
    descEn: {
      type: String,
      default: "",
    },
    descFa: {
      type: String,
      default: "",
    },
    image: {
      type: String,
      default: "",
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    orderingShowInList: {
      type: Number,
      default: 0,
    },
    special: {
      type: Boolean,
      default: false,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
