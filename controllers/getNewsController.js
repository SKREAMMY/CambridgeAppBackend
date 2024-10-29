const { spawn } = require("child_process");
const fs = require("fs");
const cronjob = require('node-cron')

// const sys = require('sys')

const LocalBBC = require("../models/localNewsBBCModel");
const GlobalTopStoriesBBC = require("../models/globalNewsBBCModel");
const GlobalWorldBBC = require("../models/globalWorld");
const GlobalBusinessBBC = require("../models/globalBusiness");
const GlobalHealthBBC = require("../models/globalHealth");
const GlobalScienceBBC = require("../models/globalScience");

var response = []

cronjob.schedule("*/30 * * * *", () => {



    async function getLocalBBCNewsFunction() {


        console.log("getting bcci news ");
        const pythonscript = await spawn('python', ['./scripts/bbci.py']);

        let chuncks = []
        pythonscript.stdout.on("data", (data) => {
            // console.log('Piping bcci news ...');
            // console.log(`data for stdout bcc ${data}`);
            chuncks.push(data);

            async function readfile() {
                global.bccidata = await fs.promises.readFile('./newsJSON/bcci.json', { encoding: 'utf-8' })
                console.log("filecontent ", global.bccidata);
                //  = filecontent;
            }
            // console.log("file read for bcci ", global.bccidata);


            readfile();





        })

        pythonscript.stderr.on('data', (data) => {
            console.log(` data for stderr + ${data}`);
        })

        pythonscript.on('close', () => {
            console.log("closed bcci");
        })

        // console.log({ bccidata });

    }

    async function getLocalNewsfunction() {



        const python = await spawn('python', ['./scripts/cambridge-news.py']);

        // sys.stdout.flush()
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


                await LocalBBC.collection.drop();
                await LocalBBC.create(d).then((response) => {
                    console.log("created");
                    console.log("added ", index, " ", d);

                }).catch((err) => {
                    console.log("unable to add the data");
                });

            })
            console.log("closed cbn");
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