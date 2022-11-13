const express = require("express");
const route = require("./routes/route.js");
const mongoose = require("mongoose");
// const core = require('core')
const multer = require("multer");


const app = express();
// app.use(core())
app.use(express.json());
app.use(multer().any());

mongoose   
  .connect("mongodb+srv://sourabh:sourabh@cluster0.xlmh3by.mongodb.net/project5")
  .then(() => console.log("MongoDb is connected"))
  .catch((err) => console.log(err));

app.use("/", route);

app.listen(process.env.PORT || 3005, function () {
  console.log("Express app running on port " + (process.env.PORT || 3005));
});
