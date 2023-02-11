import express from "express";
import helmet from "helmet";
import compression from "compression";
import { mw } from "request-ip";
import { createServer } from "https";
import { readFileSync } from "fs";
import { join } from "path";

import config from "./config";
import routes from "./routes";
import errors from "./errors";
import CustomRequest from "./types/CustomRequest";

const ssl = {
    key: readFileSync(join(__dirname, "../key.pem")),
    cert: readFileSync(join(__dirname, "../cert.pem")),
}

const app = express();
app.use(helmet());
app.use(compression());
app.use(mw());

app.use("*", (req, res) => {
    const url = req.baseUrl !== "" ? req.baseUrl : "/";
    if (url === "/favicon.ico") return;
    
    const route = routes.find(route => route.path === url ? route : undefined);

    if (!route) return res.status(404).send(`Error: ${errors.NOT_FOUND}`);

    const customRequest: CustomRequest = req;
    customRequest.config = config;

    route?.handler(customRequest, res);
});

const sslServer = createServer(ssl, app);

sslServer.listen(config.serverSettings.port, () => {
    console.log(`Server listening at https://localhost:${config.serverSettings.port}`);
});