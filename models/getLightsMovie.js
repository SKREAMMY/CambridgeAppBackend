const mongoose = require("mongoose")

const LightsSchema = new mongoose.Schema(
    {
        filmTitle: String,
        synopsisShort: String,
        director: String,
        filmUrl: String,
        duration: String,
        posterImageSrc: String,
        sessions: Array,

    }
)