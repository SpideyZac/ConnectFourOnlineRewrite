import { Response } from "express";

import CustomRequest from "./CustomRequest";

export default interface Route {
    path: string
    handler: (req: CustomRequest, res: Response) => Promise<void> | void
};