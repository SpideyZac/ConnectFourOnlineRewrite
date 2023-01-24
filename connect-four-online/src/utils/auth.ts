import PocketBase from "pocketbase";
import type { NextApiRequest } from "next";

import config from "@/config";

export async function authenticateUser(pb: PocketBase, token: string, id: string) {
    try {
        const user = await pb.collection("users").getOne(id);
        pb.authStore.save(token, user);

        if (!pb.authStore.isValid) {
            return false;
        }

        return user;
    } catch (e) {
        return false;
    }
}

export async function authenticateRequest(pb: PocketBase, req: NextApiRequest) {
    await authAsAdmin(pb);
    if (!req.headers.authorization) return { json: { success: false, error: "Invalid Authorization" }, code: 401 };
    const auth = req.headers.authorization.split(" ");
    if (auth.length < 2) return { json: { success: false, error: "Authorization must have token and id" }, code: 400 };
    const user = await authenticateUser(pb, auth[0], auth[1]);
    if (!user) return { json: { success: false, error: "Invalid Authorization" }, code: 401 };

    return user;
}

export async function authAsAdmin(pb: PocketBase) {
    await pb.admins.authWithPassword(config.auth.username, config.auth.password);
}