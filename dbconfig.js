const mongoose = require('mongoose');

const mongoURL = process.env.mongoURL


// Replace with your MongoDB Atlas connection string
// const mongoDBURI = 'mongodb+srv://manimekalaieee123:jkquzbD0UaHMXTHs@cluster0.ezedxlm.mongodb.net/';

// Connect to MongoDB
console.log('mongoURL:', mongoURL);

mongoose
  .connect(mongoURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch((error) => {
    console.error('Error connecting to MongoDB Atlas:', error.message);
    process.exit(1);
  });
