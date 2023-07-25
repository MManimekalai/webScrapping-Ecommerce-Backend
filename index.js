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

NODE_SERVER.get('/', function (resquest, response) {
    response.send("Testing");
})

NODE_SERVER.use('/api/v1', APP_SERVER);

const port = 4000;

NODE_SERVER.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
