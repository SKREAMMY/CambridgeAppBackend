

const mongoose = require("mongoose");

const globalBusinessSchema = new mongoose.Schema(
    {
        title: String,
        link: String,
        guid: Object,
        description: String,
        pubDate: Date,
        author: Object,
        category: String,
        enclosure: Object,
        mediaThumbnail: Object
    }
)

const GlobalBusinessBBC = mongoose.model("GlobalBusinessBBC", globalBusinessSchema);

module.exports = GlobalBusinessBBC;