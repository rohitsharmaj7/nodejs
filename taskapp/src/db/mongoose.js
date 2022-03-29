const mongoose = require("mongoose");

// Connecting to the Database (MongoDB) using Mongoose
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
});
