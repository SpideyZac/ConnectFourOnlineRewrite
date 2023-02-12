export default {
    databaseSettings: {
        mongoURI: "mongodb://localhost:27017/connect-four-online",
        mongoIPFamily: 4,
    },
    serverSettings: {
        useSSL: true,
        port: 8000,
    },
    rateLimitGlobal: {
        points: 10,
        duration: 3,
    },
};