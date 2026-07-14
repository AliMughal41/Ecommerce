const mongoose = require('mongoose');

const connectDatabase = () => {
  mongoose
    .connect(process.env.MONGO_URI)
    .then((data) => {
      console.log(`Mongodb connected with server: ${data.connection.host}`);
    })
    .catch((err) => {
      console.error(`Error connecting to mongodb: ${err.message}`);
      process.exit(1);
    });
};

module.exports = connectDatabase;
