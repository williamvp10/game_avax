import { Router } from "express";
import {addPlayerToQueue} from "../controllers/matchmakingController.js";
import Player from "../models/matchmakingModel.js";

const router = Router();

router.post('/join', (req, res) => {
    const { id, cups, level, socketId, skinId, walletAddress } = req.body; 
    const player = new Player(id, cups, level);
    const match = addPlayerToQueue(player, socketId, skinId, walletAddress);

    if (match) {
        res.status(200).json({ match });
    } else {
        res.status(200).json({ message: "Waiting for more players..." });
    }
});

export default router;