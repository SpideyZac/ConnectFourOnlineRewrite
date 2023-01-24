import type { NextApiRequest, NextApiResponse } from "next";
import { Record } from "pocketbase";

import createPB from "@/utils/pb";
import { authenticateRequest, authAsAdmin } from "@/utils/auth";

type Data = {
    success: boolean
    error?: unknown
    team?: number
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
    const pb = createPB();
    const authUser = await authenticateRequest(pb, req);

    if (authUser.json) return res.status(authUser.code).json(authUser.json);
    await authAsAdmin(pb);

    const user = authUser as Record;

    if (!req.body.id) return res.status(400).json({ success: false, error: "id was not present in the body" });

    const data = {
        id: req.body.id,
    };

    let game;
    try {
        game = await pb.collection("games").getOne(data.id);
    } catch (e: any) {
        return res.status(404).json({ success: false, error: e.data });
    }

    let team: number | null = null;
    if (game.player1 === user.id) {
        team = 1;
    } else if (game.player2 === user.id) {
        team = -1;
    }

    if (!team) return res.status(403).json({ success: false, error: "You are not in that game" });

    res.status(200).json({ success: true, team });
}