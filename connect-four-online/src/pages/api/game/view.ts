import type { NextApiRequest, NextApiResponse } from "next";
import { Record } from "pocketbase";

import createPB from "@/utils/pb";

type Data = {
    success: boolean
    error?: unknown
    game?: Record
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
    const pb = createPB();

    if (!req.body.id) return res.status(400).json({ success: false, error: "id was not present in the body" });

    const data = {
        id: req.body.id,
    };

    let game;
    try {
        game = await pb.collection("games").getOne(data.id);
    } catch (e) {
        return res.status(404).json({ success: false, error: "That game was not found" });
    }

    res.status(200).json({ success: true, game });
}