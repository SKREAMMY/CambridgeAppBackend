const mongoose = require("mongoose");

const globalWorldSchema = new mongoose.Schema(
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

const GlobalWorldBBC = mongoose.model("GlobalWorldBBC", globalWorldSchema);

module.exports = GlobalWorldBBC