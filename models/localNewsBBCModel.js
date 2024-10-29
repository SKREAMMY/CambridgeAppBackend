const mongoose = require("mongoose")

const localBCCNewsSchema = new mongoose.Schema({
    title: String,
    link: String,
    guid: Object,
    description: String,
    pubDate: Date,
    author: Object,
    category: String,
    enclosure: Object,
    mediaThumbnail: Object,
    mediaKeywords: String,


});

const LocalBBCNews = mongoose.model("LocalBBC", localBCCNewsSchema);



module.exports = LocalBBCNews;