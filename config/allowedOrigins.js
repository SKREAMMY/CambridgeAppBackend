const options = {
    origin: (origin, callback) => {
        const allowedOrigins = [
            "http://3.93.56.149",
            "http://localhost:5173",
        ];

        // Allow requests with no origin (e.g., mobile apps or Postman)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
};
module.exports = options;