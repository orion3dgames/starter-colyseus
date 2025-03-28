// Colyseus + Express
import config from "@colyseus/tools";
import express from "express";

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
        /**
         * Use @colyseus/playground
         * (It is not recommended to expose this route in a production environment)
         */
        if (process.env.NODE_ENV !== "production") {
            app.use("/play", playground());
        }

        // matchmaker query
        app.get("/rooms/:roomName?", async (req, res) => {
            const conditions: any = {
                locked: false,
                private: false,
            };
            if (req.query.roomName) {
                conditions["roomId"] = req.query.roomName;
            }
            res.json(await matchMaker.query(conditions));
        });

        // default to built client index.html
        let indexPath = "../../dist/client/";

        // server static files
        app.use(express.static(indexPath));

        //
        if (process.env.NODE_ENV !== "production") {
            app.use("/play", playground());
            app.use("/monitor", monitor());
        }
    },

    beforeListen: () => {
        /**
         * Before before gameServer.listen() is called.
         */
    },
});
