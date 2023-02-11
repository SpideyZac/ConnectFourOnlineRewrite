import { RateLimiterMemory } from "rate-limiter-flexible";
import { Response } from "express";

import CustomRequest from "./CustomRequest";

export default interface Route {
    path: string
    rateLimiter?: RateLimiterMemory
    handler: (req: CustomRequest, res: Response) => Promise<void> | void
};