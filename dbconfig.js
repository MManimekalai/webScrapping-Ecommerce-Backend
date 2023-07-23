const mongoose = require('mongoose');


// Replace with your MongoDB Atlas connection string
const mongoDBURI = 'mongodb+srv://manimekalaieee123:jkquzbD0UaHMXTHs@cluster0.ezedxlm.mongodb.net/';

// Connect to MongoDB
mongoose.connect(mongoDBURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB Atlas'))
.catch((error) => console.error('Error connecting to MongoDB Atlas:', error.message));

module.exports = {mongoDBURI}