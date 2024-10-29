const express = require("express");
const { getGlobalNews, getLocalNews } = require("../controllers/getNewsController");
const router = express.Router();


const GlobalNewsMiddleware = (req, res, next) => {



    next();
}

const getLocalNewsMiddleware = (req, res, next) => {
    next();
}

router.route("/global").get(GlobalNewsMiddleware, getGlobalNews);
router.route("/global/:newsType").get(GlobalNewsMiddleware, getGlobalNews);
router.route("/local").get(getLocalNewsMiddleware, getLocalNews);




module.exports = router;