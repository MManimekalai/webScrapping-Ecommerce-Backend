const express = require('express');
const APP_SERVER = express.Router();
const bodyparser = require('body-parser'); // Fix: Use the correct variable name
const cron = require('node-cron');
const mongoose = require('mongoose');
const connectDB = require('./dbconfig')

// Middleware to parse incoming requests with JSON and urlencoded payloads
APP_SERVER.use(bodyparser.urlencoded({ extended: true }));
APP_SERVER.use(bodyparser.json());

// Importing the scrapers and product models
const amazonScraper = require('./amazonScrap');
const flipkartScraper = require('./flipkartScrap');
const snapdealScraper = require('./snapdealScrap');
const { amazonproduct, flipkartproduct, snapdealproduct } = require('./productModel');

// Endpoint to scrape and get product details from Amazon
APP_SERVER.get('/amazon', async (req, res) => {
  try {
    const productDetails = await amazonScraper.getProductDetails();
    res.json(productDetails);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while scraping data.' });
  }
});

// Endpoint to scrape and get product details from Flipkart
APP_SERVER.get('/flipkart', async (req, res) => {
  try {
    const productDetails = await flipkartScraper.getProductDetails();
    res.json(productDetails);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while scraping data.' });
  }
});

// Endpoint to scrape and get product details from Snapdeal
APP_SERVER.get('/snapdeal', async (req, res) => {
  try {
    const productDetails = await snapdealScraper.getProductDetails();
    res.json(productDetails);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while scraping data.' });
  }
});

// Function to scrape data from all three websites and insert it into the database
const scrapeAndInsertData = async () => {
  try {
    // Scrape data from all three websites
    const amazonData = await amazonScraper.getProductDetails();
    const flipkartData = await flipkartScraper.getProductDetails();
    const snapdealData = await snapdealScraper.getProductDetails();

    // Save the data to your MongoDB collections or any other storage
    // For simplicity, we are not connecting/disconnecting to the database here
    // Make sure you set up the database connection appropriately in your application.
    // Assuming you have the appropriate models for each website's data (amazonproduct, flipkartproduct, snapdealproduct)
    await amazonproduct.insertMany(amazonData);
    await flipkartproduct.insertMany(flipkartData);
    await snapdealproduct.insertMany(snapdealData);

    console.log('Data saved to MongoDB Atlas successfully.');
  } catch (error) {
    console.error('Error occurred during scraping and data insertion:', error);
    throw new Error('An error occurred while scraping and saving data.');
  }
};

// Schedule the data scraping and insertion task using cron job, runs every 12 hours
cron.schedule('0 */12 * * *', async () => {
  try {
    console.log('Running scraping and data insertion task...');
    await scrapeAndInsertData();
    console.log('Scraping and data insertion task completed successfully.');
  } catch (error) {
    console.error('Error occurred during scraping and data insertion:', error.message);
  }
});

// Endpoint to search for products using a search term (query parameter)
APP_SERVER.get('/search/:searchTerm', async (req, res) => {

  await connectDB();

  const {searchTerm} = req.params; // Assuming search term is passed as a query parameter
  const page = parseInt(req.query.page) || 1;
  const limit = 10; // Number of results per page

  console.log('Received search request with searchTerm:', searchTerm);

  try {
    const skip = (page - 1) * limit;

    console.log('Executing amazonproduct search...');
    const amazonResults = await amazonproduct.find({ $text: { $search: searchTerm } })
      .skip(skip)
      .limit(limit);
    console.log('amazonproduct search results:', amazonResults);

    console.log('Executing snapdealproduct search...');
    const snapdealResults = await snapdealproduct.find({ $text: { $search: searchTerm } })
      .skip(skip)
      .limit(limit);
    console.log('snapdealproduct search results:', snapdealResults);

    console.log('Executing flipkartproduct search...');
    const flipkartResults = await flipkartproduct.find({ $text: { $search: searchTerm } })
      .skip(skip)
      .limit(limit);
    console.log('flipkartproduct search results:', flipkartResults);

    // Merge the results from all collections into a single array
    const combinedResults = [...flipkartResults, ...amazonResults, ...snapdealResults];

    if (combinedResults.length === 0) {
      // No matching products found for the search term
      res.json({
        status: 'success',
        message: 'No matching products found for the search term.',
        data: [],
      });
    } else {
      // Optionally, sort and paginate the combinedResults

      // Send the combined and paginated results as the API response
      res.json({
        status: 'success',
        message: 'Search successful.',
        data: combinedResults,
      });
    }
  } catch (error) {
    console.error('Error during search:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred during the search.',
      error: error.message,
    });
  }
});

// Endpoint to drop all collections from databases
APP_SERVER.post('/drop-collections', async (req, res) => {

  await connectDB();

  try {
    // Get the list of all collection names in the connected database
    const collectionNames = await mongoose.connection.db.listCollections().toArray();

    // Iterate through each collection and drop it
    for (const collection of collectionNames) {
      await mongoose.connection.db.dropCollection(collection.name);
      console.log(`Dropped collection: ${collection.name}`);
    }

    res.json({ message: 'All collections dropped successfully.' });
  } catch (error) {
    console.error('Error dropping collections:', error);
    res.status(500).json({ error: 'An error occurred while dropping collections.' });
  }
});

module.exports = APP_SERVER;
