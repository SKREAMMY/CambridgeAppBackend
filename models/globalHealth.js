const mongoose = require("mongoose");


const globalHealthSchema = new mongoose.Schema({
    title: String,
    link: String,
    guid: Object,
    description: String,
    pubDate: Date,
    author: Object,
    category: String,
    enclosure: Object,
    mediaThumbnail: Object
});

const GlobalHealthBBC = mongoose.model("GlobalHealthBBC", globalHealthSchema);

module.exports = GlobalHealthBBC;