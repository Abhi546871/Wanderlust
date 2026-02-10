const mongoose = require('mongoose');
const data = require('./data');
const Listing = require('../models/listing');
main().then(()=>{
    console.log("Connected to MongoDB");
}).catch((err)=>{
    console.log("Error connecting to MongoDB:", err);
});

async function main() {
    await mongoose.connect('mongodb://localhost:27017/Wanderlust');
}

const insertData = async () => {
    await Listing.deleteMany({});
    data.data = data.data.map((obj)=>({...obj,owner:'697cc6a91eca9f2dec4e35e2'}));
    await Listing.insertMany(data.data);
    console.log("Data inserted successfully");
}
insertData();


