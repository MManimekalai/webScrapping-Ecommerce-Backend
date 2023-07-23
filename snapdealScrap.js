const axios = require('axios');
const cheerio = require('cheerio');
const mongoose = require('mongoose');
const dbConfig = require('./dbconfig');
const { snapdealproduct } = require('./productModel'); // Assuming you have the productModel.js in the same directory
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
};

const url = 'https://www.snapdeal.com/products/electronics-bluetooth-speakers?sort=plrty';

// Function to fetch product details from the Snapdeal website
const getProductDetails = async () => {
  try {
    // Make an HTTP GET request to the specified URL with custom headers
    const response = await axios.get(url, { headers });
    const $ = cheerio.load(response.data);

    // Array to store product details
    const productTitles = [];

    // Loop through each product card on the page
    $('.product-tuple-listing').each((index, element) => {
      if (index >= 10) return; // Limit the number of products to 10

      const $card = $(element);
      // Extract relevant information from the product card
      const imageUrl = $card.find('.picture-elem img').attr('src');
      const title = $card.find('.product-title').text();
      const originalPrice = $card.find('.product-desc-price.strike').text().replace('Rs. ', '').trim();
      const finalPriceWithOffer = $card.find('.product-price').text();
      const rating = $card.find('.filled-stars').attr('style');
      const numberOfRatingsStr = $card.find('.product-rating-count').text().replace(/\D+/g, '');
      const numberOfRatings = parseInt(numberOfRatingsStr);

      // Handling cases where the number of ratings is not a valid number
      const finalNumberOfRatings = Number.isNaN(numberOfRatings) ? 0 : numberOfRatings;

      // Create a product object with the extracted details and add it to the productTitles array
      const product = {
        imageUrl,
        title,
        rating,
        numberOfRatings: finalNumberOfRatings,
        finalPriceWithOffer,
        originalPrice
      };

      productTitles.push(product);
    });

    // Connect to MongoDB Atlas
    await mongoose.connect(dbConfig.mongoDBURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Save the productTitles to the MongoDB collection using the snapdealproduct model
    await snapdealproduct.insertMany(productTitles);

    console.log('Data saved to MongoDB Atlas successfully.');

    // Close the MongoDB connection
    await mongoose.disconnect();

    // Introduce a delay of 1 second before returning the results to avoid overloading the server
    await delay(1000);

    // Return the product details
    return productTitles;
  } catch (error) {
    console.error(error);
    throw new Error('An error occurred while scraping data.');
  }
};

// Export the getProductDetails function to be used in other modules
module.exports = { getProductDetails };
