const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
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
    icon: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;
