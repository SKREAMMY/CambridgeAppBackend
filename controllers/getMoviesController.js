
const nodecron = require("node-cron")
const VueModel = require("../models/getVueMovies")
const { spawn } = require("child_process")

nodecron.schedule("0 */4 * * * ", () => {

    async function getVueMovies() {

        await VueModel.collection.drop((err, ok) => {
            if (err) {
                console.log("cant delete vue model");

            }
            if (ok) {
                console.log("db deleted for vue");

            }
        });


        const python = await spawn('python', ['./scripts/veu-cinemas.py']);

        let chuncks = []
        // sys.stdout.flush()
        python.stdout.on('data', async (data) => {


            // console.log(`${data}`);
            // console.log(`${data}`);




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

    getVueMovies();

})

getMovies = async (req, res) => {


    console.log("I got ", req.params["cinematype"]);
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