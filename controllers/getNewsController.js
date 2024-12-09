const { spawn } = require("child_process");
const fs = require("fs");
const cronjob = require('node-cron')
const parseString = require("xml2js").parseString;
const fetch = require("node-fetch");

// const sys = require('sys')

const LocalBBC = require("../models/localNewsBBCModel");
const GlobalTopStoriesBBC = require("../models/globalNewsBBCModel");
const GlobalWorldBBC = require("../models/globalWorld");
const GlobalBusinessBBC = require("../models/globalBusiness");
const GlobalHealthBBC = require("../models/globalHealth");
const GlobalScienceBBC = require("../models/globalScience");
const { log } = require("console");

var response = []
var http = require("https")

cronjob.schedule("*/59 * * * *", () => {



    async function getLocalNewsfunction() {


        function convertXMLToJSON(url, callback) {

            var req = http.get(url, (res) => {
                var xml = "";
                res.on("data", function (chunk) {
                    xml += chunk;
                });

                res.on("err", function (err) {
                    callback(err, null);
                });
                res.on('timeout', function (err) {
                    callback(err, null);
                });
                res.on("end", function () {
                    parseString(xml, (err, result) => {
                        callback(null, result);
                    })
                })

            })
        }


        async function appendNewstoDB(localnewsdata) {

            await LocalBBC.collection.drop().then((res) => {
                console.log("deleted first obj");

            });

            localnewsdata.map(async (news) => {

                await LocalBBC.create(news).then((result) => {
                    console.log("successfully added data ", news);

                }).catch((error) => {
                    console.log("error in adding to database", error);

                });
            })


        }



        const url = "https://www.cambridge-news.co.uk/?service=rss";
        convertXMLToJSON(url, (err, data) => {
            if (err) {
                console.log("error ", err);

            }
            else {
                var rawlocalnewsdata = data?.rss.channel[0].item;
                console.log(rawlocalnewsdata[0].enclosure);

                var localnewsdata = []
                rawlocalnewsdata.map((data) => {
                    var templocalnews = {};
                    templocalnews["title"] = data.title[0];
                    templocalnews["link"] = data.link[0];
                    templocalnews["guid"] = data.guid[0];
                    templocalnews["description"] = data.description[0];
                    templocalnews["pubDate"] = data.pubDate[0];
                    templocalnews["enclosure"] = data["enclosure"][0]["$"]["url"];
                    templocalnews["mediaThumbnail"] = data["media:thumbnail"][0]["$"];
                    localnewsdata.push(templocalnews);

                })
                appendNewstoDB(localnewsdata);
            }
        })

    }


    getLocalNewsfunction();
    // getLocalBBCNewsFunction();


})


cronjob.schedule(" */30 * * * * ", () => {

    async function getGlobalDataBBC(database, url) {


        const python = await spawn('python', ['./scripts/convertBBCXmltoJson.py', url]);

        let chuncks = []
        python.stdout.on('data', (data) => {

            chuncks.push(data);
        })



        python.stderr.on('data', (data) => {
            console.log(` data for stderr + ${data}`);
        })

        python.on('close', () => {
            let data = Buffer.concat(chuncks);
            let result = JSON.parse(data);
            console.log("finally data is  ", result);
            result["data"].map(async (d, index) => {


                await database.collection.drop((err, ok) => {
                    if (err) {
                        console.log("cant delete global world db");

                    }
                    if (ok) {
                        console.log("db deleted");

                    }
                });
                await database.create(d).then((response) => {
                    console.log("created");
                    console.log("added ", index, " ", d);

                }).catch((err) => {
                    console.log("unable to add the data");
                });

            })
            console.log("closed cbn");
        })


    }

    getGlobalDataBBC(GlobalTopStoriesBBC, "https://feeds.bbci.co.uk/news/rss.xml");
    getGlobalDataBBC(GlobalWorldBBC, "https://feeds.bbci.co.uk/news/world/rss.xml");
    getGlobalDataBBC(GlobalBusinessBBC, "https://feeds.bbci.co.uk/news/business/rss.xml");
    getGlobalDataBBC(GlobalHealthBBC, "https://feeds.bbci.co.uk/news/health/rss.xml");
    getGlobalDataBBC(GlobalScienceBBC, "https://feeds.bbci.co.uk/news/science_and_environment/rss.xml");

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






    // fs.readFile('./newsJSON/bcci.json', 'utf-8', (err, data) => {
    //     datatosend = JSON.parse(data);
    //     res.status(200).json({ success: true, data: datatosend });
    // })



}

getLocalNews = async (req, res, next) => {

    // let result
    // try {
    //     result = LocalBBC.find({});

    // } catch (err) {
    //     console.log(err);
    // }

    const resultdata = await LocalBBC.find({});
    // console.log({ resultdata });


    res.status(200).json({ success: true, data: resultdata });


}





module.exports = { getGlobalNews, getLocalNews }