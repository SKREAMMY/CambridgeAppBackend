const mongoose = require("mongoose")

const localBCCNewsSchema = new mongoose.Schema({
    title: String,
    link: String,
    guid: Object,
    description: String,
    pubDate: Date,
    enclosure: String,
    mediaThumbnail: Object,



});

const LocalBBCNews = mongoose.model("LocalBBC", localBCCNewsSchema);



module.exports = LocalBBCNews;