
const nodecron = require("node-cron")
const axios = require('axios');
const VueModel = require("../models/getVueMovies")
const { spawn } = require("child_process")
const { CookieJar } = require("tough-cookie");
const { wrapper } = require("axios-cookiejar-support");
const puppeteer = require("puppeteer");

const jar = new CookieJar();
const client = wrapper(axios.create({ jar }));

const convertDateTimeFormatForVue = (date) => {
    const newdate = new Date(date);
    const formattedDate = newdate.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
    });
    return formattedDate;
}

nodecron.schedule("*/3 * * * * ", () => {

    async function fetchVueMovies() {

        let vue_movieList = { "data": [] };
        try {
            const browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox'], // Necessary for running in Docker
            });

            const page = await browser.newPage();

            // Set headers to mimic a real browser
            await page.setUserAgent(
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            );

            const baseUrl = 'https://www.myvue.com';
            await page.goto(baseUrl, { waitUntil: 'networkidle2' });
            console.log('Session established.');

            const cookies = await browser.cookies();
            // console.log('Cookies:', cookies);

            const apiUrl =
                'https://www.myvue.com/api/microservice/showings/cinemas/10016/films?minEmbargoLevel=3&includesSession=true&includeSessionAttributes=true';

            await page.goto(apiUrl, { waitUntil: 'networkidle2' });

            const jsonResponse = await page.evaluate(() => {
                console.log("doc ", document.body.innerText);

                return JSON.parse(document.body.innerText);
            });

            const fetchedData = jsonResponse;
            const vueServerData = fetchedData.result;

            for (let i = 0; i < vueServerData.length; i++) {

                const movie_details = {};
                movie_details["filmTitle"] = vueServerData[i]["filmTitle"];
                movie_details["synopsisShort"] = vueServerData[i]["synopsisShort"];
                movie_details["director"] = vueServerData[i]["director"];
                movie_details["filmUrl"] = vueServerData[i]["filmUrl"];
                movie_details["posterImageSrc"] = vueServerData[i]["posterImageSrc"];
                movie_details["sessions"] = {};

                for (let j = 0; j < vueServerData[i]["showingGroups"].length; j++) {
                    let movie_sessions = [];

                    for (let k = 0; k < vueServerData[i]["showingGroups"][j]["sessions"].length; k++) {

                        let movie_session_details = {};
                        movie_details["duration"] = vueServerData[i]["showingGroups"][j]["sessions"][k]["duration"];
                        movie_session_details["startTime"] = vueServerData[i]["showingGroups"][j]["sessions"][k]["startTime"];
                        movie_session_details["endTime"] = vueServerData[i]["showingGroups"][j]["sessions"][k]["endTime"];
                        movie_session_details["Tickets available"] = vueServerData[i]["showingGroups"][j]["sessions"][k]["isSoldOut"];
                        movie_session_details["bookingUrl"] = baseUrl + vueServerData[i]["showingGroups"][j]["sessions"][k]["bookingUrl"];
                        movie_session_details["screenName"] = vueServerData[i]["showingGroups"][j]["sessions"][k]["screenName"];
                        movie_session_details["dateofShow"] = vueServerData[i]["showingGroups"][j]["sessions"][k]["showTimeWithTimeZone"];
                        movie_session_details["price"] = vueServerData[i]["showingGroups"][j]["sessions"][k]["formattedPrice"];
                        movie_sessions.push(movie_session_details);
                    }
                    movie_details["sessions"][convertDateTimeFormatForVue(vueServerData[i]["showingGroups"][j]["date"])] = movie_sessions;
                }
                vue_movieList["data"].push(movie_details);

            }

        } catch (error) {
            console.error('Error:', error.message);

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
                console.log("created movies");
                // console.log("added ", index, response);

            }).catch((err) => {
                console.log("unable to add the data");
            });

        })


    }

    fetchVueMovies();

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