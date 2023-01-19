import express, { json, urlencoded } from "express";
import helmet from "helmet";
import { mw } from "request-ip";
import hpp from "hpp";

const app = express();
app.use(json());
app.use(urlencoded({
    extended: false,
}));
app.use(helmet({
    crossOriginResourcePolicy: false,
}));
app.use(mw());
app.use(hpp());

console.log("Listening at http://localhost:3000");
app.listen(3000);