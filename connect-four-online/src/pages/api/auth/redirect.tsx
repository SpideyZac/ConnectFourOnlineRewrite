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
    if (!req.query.state || !req.query.code) return res.status(400).json({ success: false, error: "state or code was missing from query commands" });
    if (!store.get("provider") || !store.get("redirect")) return res.status(400).json({ success: false, error: "provider or redirect were not present in localStorage " });

    const provider = JSON.parse(store.get("provider"));

    if (provider.state !== req.query.state) return res.status(400).json({ success: false, error: "provider state does not match query state" });

    try {
        const authData = await pb.collection("users").authWithOAuth2(
            provider.name,
            req.query.code as string,
            provider.codeVerifier,
            redirectURL,
        );

        res.redirect(`${store.get("redirect")}?authdata=${encodeURIComponent(JSON.stringify(authData))}`);
    } catch (e: any) {
        return res.status(401).json({ success: false, error: e.data });
    }
}