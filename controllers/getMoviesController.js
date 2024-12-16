
const nodecron = require("node-cron")
const axios = require('axios');
const VueModel = require("../models/getVueMovies")
const { spawn } = require("child_process")
const { CookieJar } = require("tough-cookie");
const { wrapper } = require("axios-cookiejar-support");

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

nodecron.schedule("0 */4 * * *  ", () => {

    const vue_movieList = { "data": [] };

    async function fetchVueMovies() {

        try {
            const vue_url = "https://www.myvue.com";
            const sessionResponse = await client.get("https://www.myvue.com");
            console.log("connection established ", sessionResponse.status);

            const dataResponse = await client.get("https://www.myvue.com/api/microservice/showings/cinemas/10016/films", {
                headers: {
                    'minEmbargoLevel': 3,
                    'includesSession': 'true',
                    'includeSessionAttributes': 'true'
                }
            })

            const vueServerData = dataResponse.data.result;


            for (let i = 0; i < vueServerData.length; i++) {

                const movie_details = {};
                movie_details["filmTitle"] = vueServerData[i]["filmTitle"];
                movie_details["synopsisShort"] = vueServerData[i]["synopsisShort"];
                movie_details["director"] = vueServerData[i]["director"];
                movie_details["filmUrl"] = vueServerData[i]["filmUrl"];
                movie_details["posterImageSrc"] = vueServerData[i]["posterImageSrc"];
                movie_details["sessions"] = {};
                // console.log("movie details are ", movie_details);
                // console.log("length of showing group is ", vueServerData[i]["showingGroups"].length);

                for (let j = 0; j < vueServerData[i]["showingGroups"].length; j++) {
                    let movie_sessions = [];
                    // console.log(`--- vueServerData ${j}---`);

                    for (let k = 0; k < vueServerData[i]["showingGroups"][j]["sessions"].length; k++) {
                        let movie_session_details = {};
                        movie_details["duration"] = vueServerData[i]["showingGroups"][j]["sessions"][k]["duration"];
                        movie_session_details["startTime"] = vueServerData[i]["showingGroups"][j]["sessions"][k]["startTime"];
                        movie_session_details["endTime"] = vueServerData[i]["showingGroups"][j]["sessions"][k]["endTime"];
                        movie_session_details["Tickets available"] = vueServerData[i]["showingGroups"][j]["sessions"][k]["isSoldOut"];
                        movie_session_details["bookingUrl"] = vue_url + vueServerData[i]["showingGroups"][j]["sessions"][k]["bookingUrl"];
                        movie_session_details["screenName"] = vueServerData[i]["showingGroups"][j]["sessions"][k]["screenName"];
                        movie_session_details["dateofShow"] = vueServerData[i]["showingGroups"][j]["sessions"][k]["showTimeWithTimeZone"];
                        movie_session_details["price"] = vueServerData[i]["showingGroups"][j]["sessions"][k]["formattedPrice"];
                        movie_sessions.push(movie_session_details);

                    }
                    movie_details["sessions"][convertDateTimeFormatForVue(vueServerData[i]["showingGroups"][j]["date"])] = movie_sessions;
                }
                vue_movieList["data"].push(movie_details);

            }

            // console.log("final movie list is ", vue_movieList["data"]);



        } catch (error) {
            console.log("error in getting data response ", error.message);

        }

        await VueModel.collection.drop((err, ok) => {
            if (err) {
                console.log("cant delete vue model");

            }
            if (ok) {
                console.log("db deleted for vue");

            }
        });

        await vue_movieList["data"].map(async (d, index) => {

            await VueModel.create(d).then((response) => {
                console.log("created movies");
                console.log("added ", index, " ", d);

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