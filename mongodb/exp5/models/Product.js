const mongoose = require("mongoose");

const variantSchema = new mongoose.Schema({
  color: String,
  size: String,
  stock: Number
});

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  variants: [variantSchema]
});

module.exports = mongoose.model("Product", productSchema);
