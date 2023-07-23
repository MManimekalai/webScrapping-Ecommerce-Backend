const axios = require('axios');
const cheerio = require('cheerio');
const mongoose = require('mongoose');

const {
  amazonproduct
} = require('./productModel'); // Assuming you have the productModel.js in the same directory
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
};

const url = 'https://www.amazon.in/alm/category/ref=s9_acss_ot_cg_Pedigree_2c1_w?almBrandId=ctnow&node=4859477031&ref=fs_dsk_sn_brkfast&pf_rd_m=A1K21FY43GMZF8&pf_rd_s=alm-storefront-desktop-dram-top-1&pf_rd_r=YSWQ6HHN5NZBPB7A8JSF&pf_rd_t=0&pf_rd_p=7041e779-5306-451c-b8fe-9d7034113511&pf_rd_i=FMCDummyValue';

// Function to fetch product details from the Amazon website
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
    $('li.a-carousel-card').each((index, element) => {
      if (index >= 10) return; // Limit the number of products to 10

      const $card = $(element);
      // Extract relevant information from the product card
      const imageUrl = $card.find('img').attr('src');
      const title = $card.find('a.a-link-normal span.a-truncate-full').text();
      const rating = $card.find('i.a-icon-star-mini').attr('class');
      const numberOfRatings = $card.find('.product-rating-count').text().replace(/\D+/g, '');
      const finalPriceWithOffer = $card.find('span.a-price-symbol').text() + $card.find('span.a-price-whole').text() + $card.find('span.a-price-decimal').text();
      const originalPrice = $card.find('span.a-size-small.a-color-secondary._alm-carousel-desktop_priceStyle_strikeThroughPrice__3UNxd').text();

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

    // Save the productTitles to the MongoDB collection using the amazonproduct model
    await amazonproduct.insertMany(productTitles);

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