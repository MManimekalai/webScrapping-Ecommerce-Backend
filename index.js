const express = require('express');
const bodyparser = require('body-parser');
const APP_SERVER = require('./app');
const NODE_SERVER = express();
const ENV = require('dotenv');
const cors = require('cors')

NODE_SERVER.use(bodyparser.urlencoded({ extended: true }));
NODE_SERVER.use(bodyparser.json());

ENV.config();
require('./dbconfig');

NODE_SERVER.use(cors())

NODE_SERVER.use('/api/v1', APP_SERVER);

const PORT = process.env.port || 8000;




NODE_SERVER.listen(PORT, 'localhost', () => console.log('Server working on PORT', PORT));
