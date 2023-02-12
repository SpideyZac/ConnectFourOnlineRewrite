import { scryptSync, randomBytes } from "crypto";
import { RateLimiterMemory } from "rate-limiter-flexible";

import Route from "../../types/Route";
import User from "../../schemas/User";

const customRateLimit = new RateLimiterMemory({
    points: 1,
    duration: 86400,
});

export default {
    path: "/user/signup",
    handler: async (req, res) => {
        try {
            await customRateLimit.consume(req.clientIp as string, 1);
        } catch (e) {
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

        if (username.length < 3 || password.length < 8) {
            res.status(400).json({
                success: true,
                error: "username has to have a length of 3 or more and password has to have a length of 8 or more",
            });
            return;
        }

        if (await User.exists({ username: username })) {
            res.status(400).json({
                success: false,
                error: "user with that username already exists",
            });
            return;
        }

        const salt = randomBytes(16).toString("hex");
        const hashedPassword = scryptSync(password, salt, 64).toString("hex");

        await User.create({ username: username, password: `${salt}:${hashedPassword}` });

        res.status(201).json({
            success: true,
        });
    },
} as Route;