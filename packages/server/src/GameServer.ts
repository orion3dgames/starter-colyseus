// Colyseus + Express
import { createServer } from "http";
import express from "express";
import path from "path";
import cors from "cors";
import { Config } from "../../shared/Config";
import Logger from "../../shared/Utils/Logger";

import { Server, matchMaker } from "@colyseus/core";
import { WebSocketTransport } from "@colyseus/ws-transport";
import { monitor } from "@colyseus/monitor";

import { GameRoom } from "./rooms/GameRoom";

//////////////////////////////////////////////////
//////////////////////////////////////////////////
//////////////////////////////////////////////////

export default class GameServer {
    public config: Config;

    constructor() {
        this.config = new Config();
        this.init();
    }

    async init() {
        // default to built client index.html
        let indexPath = "../../dist/client/";
        let clientFile = "index.html";

        // start server
        const port = process.env.PORT || 3000;
        const app = express();
        app.use(cors());
        app.use(express.json());

        //
        app.use("/colyseus", monitor());

        // matchmaker query
        app.get("/rooms/:roomName?", (req, res) => {
            const conditions: any = {
                locked: false,
                private: false,
            };
            if (req.query.roomName) {
                conditions["roomId"] = req.query.roomName;
            }
            res.json(matchMaker.query(conditions));
        });

        // server staic files
        app.use(express.static(indexPath));

        // serve client
        let indexFile = path.resolve(indexPath + clientFile);
        app.get("/", function (req, res) {
            //res.send("Hello World!");
            res.sendFile(indexFile);
        });

        //////////////////////

        // create colyseus server
        const gameServer = new Server({
            transport: new WebSocketTransport({
                server: createServer(app),
            }),
        });

        // Expose the "lobby" room.
        gameServer.define("gameroom", GameRoom).enableRealtimeListing();

        gameServer.listen(port).then(() => {
            // server is now running
            Logger.info("[gameserver] listening on http://localhost:" + port);
        });

        // on localhost, simulate bad latency
        if (process.env.NODE_ENV !== "production") {
            Logger.info("[gameserver] Simulating 200ms of latency.");
            gameServer.simulateLatency(200);
        }
    }
}
