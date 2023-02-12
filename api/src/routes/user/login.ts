import { scryptSync, timingSafeEqual } from "crypto";
import { RateLimiterMemory } from "rate-limiter-flexible";

import Route from "../../types/Route";
import User from "../../schemas/User";

const customRateLimit = new RateLimiterMemory({
    points: 5,
    duration: 30,
    blockDuration: 86400,
});

export default {
    path: "/user/login",
    handler: async (req, res) => {
        if ((await customRateLimit.get(req.clientIp as string))?.remainingPoints === 0) {
            res.status(429).json({
                success: false,
                error: "you were rate limited from that route",
            });
            return;
        }

        const { username, password } = req.body;

        if (!username || !password) {
            res.status(400).json({
                success: false,
                error: "username and/or password were missing from body",
            });
            return;
        }

        if (typeof username !== "string" || typeof password !== "string") {
            res.status(400).json({
                success: false,
                error: "username and password have to be of type string",
            });
            return;
        }

        const user = await User.findOne({ username: username });

        if (!user) {
            res.status(404).json({
                success: false,
                error: "incorrect username",
            });
            return;
        }

        const [salt, key] = (user.password as string).split(":");
        const hashedBuffer = scryptSync(password, salt, 64);

        const keyBuffer = Buffer.from(key, "hex");
        const match = timingSafeEqual(hashedBuffer, keyBuffer);

        if (!match) {
            await customRateLimit.consume(req.clientIp as string, 1);
            res.status(404).json({
                success: false,
                error: "incorrect password",
            });
            return;
        }

        res.status(200).json({
            success: true,
        });
    },
} as Route;