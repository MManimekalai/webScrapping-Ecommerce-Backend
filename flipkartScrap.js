const axios = require('axios');
const cheerio = require('cheerio');
const mongoose = require('mongoose');

const {
  flipkartproduct
} = require('./productModel'); // Assuming you have the productModel.js in the same directory
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
};

const url = 'https://www.flipkart.com/laptops-store?fm=neo%2Fmerchandising&iid=M_5f59c0c6-82a6-4f55-a29e-e93f2f9d5f87_1_372UD5BXDFYS_MC.WB1CFS0X26D1&otracker=hp_rich_navigation_2_1.navigationCard.RICH_NAVIGATION_Electronics~Laptop%2Band%2BDesktop~Laptops_WB1CFS0X26D1&otracker1=hp_rich_navigation_PINNED_neo%2Fmerchandising_NA_NAV_EXPANDABLE_navigationCard_cc_2_L2_view-all&cid=WB1CFS0X26D1';

// Function to fetch product details from the Flipkart website
const getProductDetails = async () => {
  try {
    // Make an HTTP GET request to the specified URL with custom headers
    const response = await axios.get(url, {
      headers
    });
    const $ = cheerio.load(response.data);

    // Array to store product details
    const productTitles = [];

    // Loop through each product card on the page
    $('div._4ddWXP').each((index, element) => {
      if (index >= 10) return; // Limit the number of products to 10

      const $card = $(element);
      // Extract relevant information from the product card
      const imageUrl = $card.find('img._396cs4').attr('src');
      const title = $card.find('a.s1Q9rs').text();
      const rating = $card.find('div._3LWZlK img').attr('src');
      const numberOfRatings = $card.find('.product-rating-count').text().replace(/[()]/g, '');
      const finalPriceWithOffer = $card.find('div._30jeq3').text();
      const originalPrice = $card.find('div._3I9_wc').text();

      // Create a product object with the extracted details and add it to the productTitles array
      const product = {
        imageUrl,
        title,
        rating,
        numberOfRatings,
        finalPriceWithOffer,
        originalPrice
      };

      productTitles.push(product);
    });

    // Connect to MongoDB Atlas
    await mongoose.connect(mongoURL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Save the productTitles to the MongoDB collection using the flipkartproduct model
    await flipkartproduct.insertMany(productTitles);

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
module.exports = {
  getProductDetails
};