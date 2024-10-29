const mongoose = require("mongoose")



const globalNewsBBCModel = new mongoose.Schema({
    title: String,
    link: String,
    guid: Object,
    description: String,
    pubDate: Date,
    author: Object,
    category: String,
    enclosure: Object,
    mediaThumbnail: Object
})

const GlobalTopStoriesBBC = mongoose.model("GlobalBBC", globalNewsBBCModel)

module.exports = GlobalTopStoriesBBC; 