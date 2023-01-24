import type { NextApiRequest, NextApiResponse } from "next";
import store from "store2";

import createPB from "@/utils/pb";
import { authAsAdmin } from "@/utils/auth";

type Data = {
    success: boolean
    error?: unknown
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
    const pb = createPB();
    const redirectURL = "http://localhost:3000/api/auth/redirect";
    await authAsAdmin(pb);

    //if (!req.body.redirectURL) return res.status(400).json({ success: false, error: "redirectURL was not present in the body" });

    //const data = {
    //    redirectURL: req.body.redirectURL,
    //};

    const discordAuth = (await pb.collection("users").listAuthMethods()).authProviders.filter((authProvider) => authProvider.name === "discord")[0];
    store.set("provider", JSON.stringify(discordAuth));
    //store.set("redirect", data.redirectURL);
    store.set("redirect", "http://localhost:3000/api/test");
    res.redirect(discordAuth.authUrl + redirectURL);
}