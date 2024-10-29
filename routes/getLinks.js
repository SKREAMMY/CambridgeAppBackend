const express = require("express")
const router = express.Router();

const { getLinks } = require("../controllers/getLinksController")

router.route("/").get(getLinks);

module.exports = router;