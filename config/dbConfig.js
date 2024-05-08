const mongoose = require("mongoose");
require("dotenv").config();
const URI = process.env.MONGO_URL;

// console.log(URI);

const connectedToMongo =()=>{
mongoose.connect(URI).then((res)=>{
 console.log("Connected to MongoDB Successfully!");
}).catch((error)=>{
 console.log("Failed to Connect to MongoDB Database.");
})
}

module.exports = connectedToMongo;