const mongoose = require("mongoose");

const globalScienceSchema = new mongoose.Schema({
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

const GlobalScienceBBC = mongoose.model("GlobalScienceBBC", globalScienceSchema);

module.exports = GlobalScienceBBC;