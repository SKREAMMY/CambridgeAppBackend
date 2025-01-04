
const nodecron = require("node-cron")
// const axios = require('axios');
const VueModel = require("../models/getVueMovies")
// const { spawn } = require("child_process")
// const { CookieJar } = require("tough-cookie");
// const { wrapper } = require("axios-cookiejar-support");
// const cloudscraper = require("cloudscraper");

// const jar = new CookieJar();
// const client = wrapper(axios.create({ jar }));

const puppeteer = require("pupeteer");

// const convertDateTimeFormatForVue = (date) => {
//     const newdate = new Date(date);
//     const formattedDate = newdate.toLocaleDateString("en-GB", {
//         day: "2-digit",
//         month: "short",
//     });
//     return formattedDate;
// }

nodecron.schedule("*/1 * * * * ", () => {

    async function fetchVueMovies() {

        let vue_movieList = { "data": [] };
        try {
            // const vue_url = "https://www.myvue.com";
            // const sessionResponse = await cloudscraper.get(vue_url, {
            //     headers: {
            //         "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            //         "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            //         "Referer": vue_url,
            //         "Origin": vue_url,
            //     }
            // });
            // console.log("connection established ", sessionResponse.status);

            // const dataResponse = await cloudscraper.get("https://www.myvue.com/api/microservice/showings/cinemas/10016/films?minEmbargoLevel=3&includesSession=true&includeSessionAttributes=true", {
            //     headers: {
            //         "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            //         "Referer": vue_url,
            //         "Origin": vue_url,
            //     }
            // })

            let browser;
            browser = await puppeteer.launch({
                headless: true,
                args: ["--no-sandbox", "--disable-setuid-sandbox"],
            })

            const page = await browser.newPage();

            await page.setUserAgent(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
            );

            const url = "https://www.myvue.com/api/microservice/showings/cinemas/10016/films?minEmbargoLevel=3&includesSession=true&includeSessionAttributes=true";
            console.log("navigating to URL: ", url);

            await page.goto(url, { waitUntil: "networkidle2" });
            const jsonData = await page.evaluate(() => {
                return JSON.parse(document.body.innerText);
            });

            console.log("Data fetched successfully!", jsonData.result.length, "movies found.");
            // const vueServerData = dataResponse.data.result;


            // for (let i = 0; i < vueServerData.length; i++) {

            //     const movie_details = {};
            //     movie_details["filmTitle"] = vueServerData[i]["filmTitle"];
            //     movie_details["synopsisShort"] = vueServerData[i]["synopsisShort"];
            //     movie_details["director"] = vueServerData[i]["director"];
            //     movie_details["filmUrl"] = vueServerData[i]["filmUrl"];
            //     movie_details["posterImageSrc"] = vueServerData[i]["posterImageSrc"];
            //     movie_details["sessions"] = {};
            //     // console.log("movie details are ", movie_details);
            //     // console.log("length of showing group is ", vueServerData[i]["showingGroups"].length);

            //     for (let j = 0; j < vueServerData[i]["showingGroups"].length; j++) {
            //         let movie_sessions = [];
            //         // console.log(`--- vueServerData ${j}---`);

            //         for (let k = 0; k < vueServerData[i]["showingGroups"][j]["sessions"].length; k++) {
            //             let movie_session_details = {};
            //             movie_details["duration"] = vueServerData[i]["showingGroups"][j]["sessions"][k]["duration"];
            //             movie_session_details["startTime"] = vueServerData[i]["showingGroups"][j]["sessions"][k]["startTime"];
            //             movie_session_details["endTime"] = vueServerData[i]["showingGroups"][j]["sessions"][k]["endTime"];
            //             movie_session_details["Tickets available"] = vueServerData[i]["showingGroups"][j]["sessions"][k]["isSoldOut"];
            //             movie_session_details["bookingUrl"] = vue_url + vueServerData[i]["showingGroups"][j]["sessions"][k]["bookingUrl"];
            //             movie_session_details["screenName"] = vueServerData[i]["showingGroups"][j]["sessions"][k]["screenName"];
            //             movie_session_details["dateofShow"] = vueServerData[i]["showingGroups"][j]["sessions"][k]["showTimeWithTimeZone"];
            //             movie_session_details["price"] = vueServerData[i]["showingGroups"][j]["sessions"][k]["formattedPrice"];
            //             movie_sessions.push(movie_session_details);

            //         }
            //         movie_details["sessions"][convertDateTimeFormatForVue(vueServerData[i]["showingGroups"][j]["date"])] = movie_sessions;
            //     }
            //     vue_movieList["data"].push(movie_details);

            // }

        } catch (error) {
            console.error('Error:', error.response?.status, error.response?.data, error.response?.headers);

        }

        await VueModel.collection.drop((err, ok) => {
            if (err) {
                console.log("cant delete vue model");

            }
            if (ok) {
                console.log("db deleted for vue");

            }
        });

        vue_movieList["data"].map(async (d, index) => {

            await VueModel.create(d).then((response) => {
                // console.log("created movies");
                console.log("added ", index, response);

            }).catch((err) => {
                console.log("unable to add the data");
            });

        })


    }

    fetchVueMovies();

    async function getVueMovies() {

        await VueModel.collection.drop((err, ok) => {
            if (err) {
                console.log("cant delete vue model");

            }
            if (ok) {
                console.log("db deleted for vue");

            }
        });
        // /home/node/venv/bin

        const python = await spawn('python3', ['./scripts/veu-cinemas.py']);

        let chuncks = []
        // sys.stdout.flush()
        python.stdout.on('data', async (data) => {


            // console.log(`${data}`);
            console.log(`${data}`);




            // let data_received = await JSON.parse(`${data}`);
            chuncks.push(data);

            // console.log(data_received);
            // console.log(typeof (data));
            // console.log(data_received["data"].length, " kp ");
            // console.log("I got ", data_received["data"]);
            // console.log("new data is .... ", data_received);


            // data_received["data"].map(async (d, index) => {

            //     await VueModel.create(d).then((response) => {
            //         console.log("created movies");
            //         console.log("added ", index, " ", d);

            //     }).catch((err) => {
            //         console.log("unable to add the data");
            //     });

            // })

        })

        python.stderr.on('data', (data) => {
            console.log(` data for stderr + ${data}`);
        })

        python.on("end", () => {



        })

        python.on('close', () => {
            let data = Buffer.concat(chuncks);
            let result = JSON.parse(data);
            console.log("finally data is  ", result);
            result["data"].map(async (d, index) => {

                await VueModel.create(d).then((response) => {
                    console.log("created movies");
                    console.log("added ", index, " ", d);

                }).catch((err) => {
                    console.log("unable to add the data");
                });

            })
            console.log("closed cbn");
        })



    }

    //getVueMovies();


})

getMovies = async (req, res) => {


    console.log("Displaying movies of ", req.params["cinematype"]);
    let resultdata;
    switch (req.params["cinematype"]) {
        case "lights":
            resultdata = await VueModel.find({});
            res.status(200).json({ success: true, data: resultdata });
            break;
        case "vue":
            resultdata = await VueModel.find({});
            // console.log({ resultdata });
            res.status(200).json({ success: true, data: resultdata });
            break;

        default:
            res.status(404).json({ success: false });
            break;
    }


}

module.exports = { getMovies }