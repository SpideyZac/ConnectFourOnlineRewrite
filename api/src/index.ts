import express from "express";
import helmet from "helmet";
import compression from "compression";
import { mw } from "request-ip";
import { createServer } from "https";
import { RateLimiterMemory } from "rate-limiter-flexible";
import { readFileSync } from "fs";
import { join } from "path";

import config from "./config";
import routes from "./routes";
import errors from "./errors";
import CustomRequest from "./types/CustomRequest";

import mongoose from "mongoose";

mongoose.set("strictQuery", true);
mongoose.connect(config.databaseSettings.mongoURI, { family: config.databaseSettings.mongoIPFamily }, () => {
    console.log("Connected to Database!");
});

let ssl;

if (config.serverSettings.useSSL) {
    ssl = {
        key: readFileSync(join(__dirname, "../key.pem")),
        cert: readFileSync(join(__dirname, "../cert.pem")),
    }
}

const globalRateLimit = new RateLimiterMemory({
    points: config.rateLimitGlobal.points,
    duration: config.rateLimitGlobal.duration,
});

const app = express();
app.use(helmet());
app.use(compression());
app.use(mw());

app.use("*", async (req, res) => {
    const url = req.baseUrl !== "" ? req.baseUrl : "/";
    if (url === "/favicon.ico") return;

    const route = routes.find(route => route.path === url ? route : undefined);

    if (!route) return res.status(404).json({ success: false, error: `Global Error: ${errors.NOT_FOUND}` });

    try {
        await globalRateLimit.consume(req.clientIp as string, 1);
    } catch (e) {
        return res.status(429).json({ success: false, error: `Global Error: ${errors.RATE_LIMITED}` });
    }

    const customRequest: CustomRequest = req;
    customRequest.config = config;

    route?.handler(customRequest, res);
});

if (ssl) {
    const sslServer = createServer(ssl, app);

    sslServer.listen(config.serverSettings.port, () => {
        console.log(`Server listening at https://localhost:${config.serverSettings.port}`);
    });
} else {
    app.listen(config.serverSettings.port, () => {
        console.log(`Server listening at http://localhost:${config.serverSettings.port}`);
    });
}