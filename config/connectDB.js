const mongoose = require("mongoose")

const connectDatabase = () => {
    mongoose.connect(process.env.DB_URL).then(
        (con) => {
            console.log(`Mongodb is connected `);
        }
    ).catch((err) => {
        console.log("eror connecting to mongodb ", err);
    })
};



module.exports = connectDatabase;