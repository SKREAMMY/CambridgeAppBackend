const express = require("express");
const router = express.Router();

const { getMovies } = require("../controllers/getMoviesController");

router.route("/:cinematype").get(getMovies);

module.exports = router;