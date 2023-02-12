import { Response } from "express";

import CustomRequest from "./CustomRequest";

export default interface Route {
    [k: string]: any
    path: string
    handler: (req: CustomRequest, res: Response) => Promise<void> | void
};