// productModel.js

const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  imageUrl: String,
  title: { type: String, index: 'text' },
  rating: String,
  numberOfRatings: Number,
  finalPriceWithOffer: String,
  originalPrice: String,
});

const amazonproduct = mongoose.model('amazonproduct', productSchema);
const flipkartproduct = mongoose.model('flipkartproduct', productSchema);
const snapdealproduct = mongoose.model('snapdealproduct', productSchema);

module.exports = { amazonproduct, flipkartproduct, snapdealproduct };
