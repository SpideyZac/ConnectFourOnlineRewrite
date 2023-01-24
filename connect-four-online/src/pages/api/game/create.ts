import type { NextApiRequest, NextApiResponse } from "next";
import { Record } from "pocketbase";

import createPB from "@/utils/pb";
import { authenticateRequest, authAsAdmin } from "@/utils/auth";
import { makeArray } from "@/utils/array";

type Data = {
    success: boolean
    error?: unknown
    state?: string
    team?: 1
    id?: string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
    const pb = createPB();
    const authUser = await authenticateRequest(pb, req);

    if (authUser.json) return res.status(authUser.code).json(authUser.json);
    await authAsAdmin(pb);

    const user = authUser as Record;

    if (!req.body.player2) return res.status(400).json({ success: false, error: "player2 was not present in the body" });

    const data = {
        player2: req.body.player2,
    };

    let player2;
    try {
        player2 = await pb.collection("users").getFirstListItem(`username="${data.player2}"`);
    } catch (e: any) {
        return res.status(404).json({ success: false, error: "Player2 was not found" });
    }

    if (user.username === player2.username) return res.status(400).json({ success: false, error: "Player2 cannot be the same as Player1" });

    let state: {[k: string]: any} = {};
    state.board = makeArray(7, 6, 0);
    state.column_spots = [5, 5, 5, 5, 5, 5, 5];
    state.turn = 1;
    state.finished = 0;
    state.winner = 0;
    state.tied = false;

    const newGame = await pb.collection("games").create({
        player1: user.id,
        player2: player2.id,
        state: JSON.stringify(state),
    });

    res.status(200).json({ success: true, state: JSON.stringify(state), team: 1, id: newGame.id });
}