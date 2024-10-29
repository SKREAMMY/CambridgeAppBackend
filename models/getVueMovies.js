const mongoose = require("mongoose")

const getVueSchema = mongoose.Schema(

    {
        filmTitle: String,
        synopsisShort: String,
        director: String,
        filmUrl: String,
        duration: String,
        posterImageSrc: String,
        sessions: Object,
    }
)

const VueModel = mongoose.model("VueModel", getVueSchema);

module.exports = VueModel;