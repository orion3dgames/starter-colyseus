// Colyseus + Express
import config from "@colyseus/tools";
import { createServer } from "http";
import express from "express";
import path from "path";
import cors from "cors";
import { Config } from "../../shared/Config";
import Logger from "../../shared/Utils/Logger";

import { matchMaker } from "@colyseus/core";
import { monitor } from "@colyseus/monitor";
import { playground } from "@colyseus/playground";

import { GameRoom } from "./rooms/GameRoom";

export default config({
    initializeGameServer: (gameServer) => {
        // Make sure to never call the `simulateLatency()` method in production.
        if (process.env.NODE_ENV !== "production") {
            // simulate 200ms latency between server and client.
            gameServer.simulateLatency(1000);
        }

        /**
         * Define your room handlers:
         */
        gameServer.define("gameroom", GameRoom);
    },

    initializeExpress: (app) => {
        // default to built client index.html
        let indexPath = "../../dist/client/";
        let clientFile = "index.html";

        // serve client
        let indexFile = path.resolve(indexPath + clientFile);
        app.get("/client", function (req, res) {
            res.sendFile(indexFile);
        });

        /**
         * Use @colyseus/playground
         * Use @colyseus/monitor
         * (It is not recommended to expose this route in a production environment)
         */
        if (process.env.NODE_ENV !== "production") {
            app.use("/play", playground());
            app.use("/monitor", monitor());
        }

        /**
         * matchmaker query
         */
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
    },

    beforeListen: () => {
        /**
         * Before before gameServer.listen() is called.
         */
    },
});

//////////////////////////////////////////////////
//////////////////////////////////////////////////
//////////////////////////////////////////////////

/*
export default class GameServer {
    public config: Config;

    constructor() {
        this.config = new Config();
        this.init();
    }

    async init() {
        // default to built client index.html
        //let indexPath = "../../dist/client/";
        //let clientFile = "index.html";

        // start server
        const port = process.env.PORT || 3000;
        const app = express();
        app.use(express.json());
        app.use(cors());

        // create colyseus server
        const gameServer = new Server({
            server: createServer(app),
            transport: new WebSocketTransport(),
        });

        // Expose the "game" room.
        gameServer.define("gameroom", GameRoom);

        gameServer.listen(port).then(() => {
            // server is now running
            Logger.info("[gameserver] listening on http://localhost:" + port);
        });

        // on localhost, simulate bad latency
        if (process.env.NODE_ENV !== "production") {
            Logger.info("[gameserver] Simulating 200ms of latency.");
            gameServer.simulateLatency(200);
        }

        //
        app.use("/colyseus", monitor());
        app.use("/playground", playground());

        /*
        // server static files
        app.use(express.static(indexPath));

        // serve client
        let indexFile = path.resolve(indexPath + clientFile);
        app.get("/", function (req, res) {
            res.send("Hello World!");
            //res.sendFile(indexFile);
        });
    }
}*/
