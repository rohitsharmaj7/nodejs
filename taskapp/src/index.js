const env = require("dotenv");
env.config();
const express = require("express");
const multer = require("multer");
require("../src/db/mongoose");

const userRouter = require("./routers/user");
const taskRouter = require("./routers/task");

const app = express();
const PORT = process.env.PORT;

app.use(express.json());
app.use(userRouter);
app.use(taskRouter);

app.listen(PORT, () => {
  console.log(`Server is up on the ${PORT}`);
});
