const { spawn } = require("child_process");
const fs = require("fs");
const cronjob = require('node-cron')
const parseString = require("xml2js").parseString;
const fetch = require("node-fetch");

const LocalBBC = require("../models/localNewsBBCModel");
const GlobalTopStoriesBBC = require("../models/globalNewsBBCModel");
const GlobalWorldBBC = require("../models/globalWorld");
const GlobalBusinessBBC = require("../models/globalBusiness");
const GlobalHealthBBC = require("../models/globalHealth");
const GlobalScienceBBC = require("../models/globalScience");
const { log } = require("console");

var response = []
var http = require("https")

function convertXMLToJSON(url, dbName, callback) {

    console.log("Current Database ", dbName);

    var req = http.get(url, (res) => {
        var xml = "";
        res.on("data", function (chunk) {
            xml += chunk;
        });

        res.on("err", function (err) {
            callback(err, null, dbName);
        });
        res.on('timeout', function (err) {
            callback(err, null, dbName);
        });
        res.on("end", function () {
            parseString(xml, (err, result) => {
                callback(null, result, dbName);
            })
        })

    })
}

async function appendNewstoDB(newsdata, dbName) {

    await dbName.collection.drop().then((res) => {
        console.log("deleted object");

    });

    newsdata.map(async (news) => {

        await dbName.create(news).then((result) => {
            console.log("successfully added data ", news);

        }).catch((error) => {
            console.log("error in adding to database", error);

        });
    })


}

cronjob.schedule("*/10 * * * *", () => {

    const url = "https://www.cambridge-news.co.uk/?service=rss";
    convertXMLToJSON(url, LocalBBC, (err, data, dbName) => {
        if (err) {
            console.log("error ", err);

        }
        else {
            var rawlocalnewsdata = data?.rss.channel[0].item;

            var newsdata = []
            rawlocalnewsdata.map((data) => {
                var templocalnews = {};
                templocalnews["title"] = data.title[0];
                templocalnews["link"] = data.link[0];
                templocalnews["guid"] = data.guid[0];
                templocalnews["description"] = data.description[0];
                templocalnews["pubDate"] = data.pubDate[0];
                templocalnews["enclosure"] = data["enclosure"][0]["$"]["url"];
                templocalnews["mediaThumbnail"] = data["media:thumbnail"][0]["$"];
                newsdata.push(templocalnews);

            })
            appendNewstoDB(newsdata, dbName);
        }
    })

})


cronjob.schedule(" */15 * * * * ", () => {


    const urlList = [
        ["https://feeds.bbci.co.uk/news/rss.xml", GlobalTopStoriesBBC],
        ["https://feeds.bbci.co.uk/news/world/rss.xml", GlobalWorldBBC],
        ["https://feeds.bbci.co.uk/news/business/rss.xml", GlobalBusinessBBC],
        ["https://feeds.bbci.co.uk/news/health/rss.xml", GlobalHealthBBC],
        ["https://feeds.bbci.co.uk/news/science_and_environment/rss.xml", GlobalScienceBBC]
    ]
    for (let i = 0; i < urlList.length; i++) {
        convertXMLToJSON(urlList[i][0], urlList[i][1], (err, data, dbName) => {
            if (err) {
                console.log("error ", err);

            }
            else {
                var rawnewsdata = data?.rss.channel[0].item;

                var newsdata = []
                rawnewsdata.map((data) => {
                    var tempnews = {};
                    tempnews["title"] = data.title[0];
                    tempnews["link"] = data.link[0];
                    tempnews["guid"] = data.guid[0];
                    tempnews["description"] = data.description[0];
                    tempnews["pubDate"] = data.pubDate[0];
                    tempnews["mediaThumbnail"] = data["media:thumbnail"][0]["$"];
                    newsdata.push(tempnews);

                })
                appendNewstoDB(newsdata, dbName);
            }
        })
    }

})


getGlobalNews = async (req, res, next) => {




    // console.log("Inside global news");
    let urlForRssXml, data_received;
    let resultdata;
    console.log(req.params["newsType"]);
    switch (req.params["newsType"]) {
        case "world":
            urlForRssXml = "https://feeds.bbci.co.uk/news/rss.xml";
            resultdata = await GlobalWorldBBC.find({});
            console.log(urlForRssXml);

            break;

        case "topStories":
            resultdata = await GlobalTopStoriesBBC.find({});
            break;
        case "business":
            resultdata = await GlobalBusinessBBC.find({});
            break;
        case "health":
            resultdata = await GlobalHealthBBC.find({});
            break;
        case "science":
            resultdata = await GlobalScienceBBC.find({});
            break;


        default:
            console.log("no such route");
            break;


    }

    res.status(200).json({ success: true, data: resultdata })

}

getLocalNews = async (req, res, next) => {

    const resultdata = await LocalBBC.find({});
    res.status(200).json({ success: true, data: resultdata });


}


module.exports = { getGlobalNews, getLocalNews }