const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  barcode: String,
  name: String,
  price: Number,
  rfid: String
});

module.exports = mongoose.model("Product", ProductSchema);
