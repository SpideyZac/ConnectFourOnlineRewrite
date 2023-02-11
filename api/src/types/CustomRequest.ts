import { Request } from "express";

import config from "../config";

export default interface CustomRequest extends Request {
    config?: typeof config
};