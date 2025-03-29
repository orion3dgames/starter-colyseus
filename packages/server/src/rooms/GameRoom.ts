import { StateView } from "@colyseus/schema";
import { Room, Client } from "@colyseus/core";
import Logger from "../../../shared/Utils/Logger";
import { Config } from "../../../shared/Config";
import { ServerMsg } from "../../../shared/types";
import { GameState } from "../schemas/GameState";
import { PlayerSchema } from "../schemas/PlayerSchema";
import { Navmesh } from "../controllers/Navmesh";

//import * as recast from "recast-navigation";
import { init, NavMeshQuery } from "recast-navigation";

export class GameRoom extends Room<GameState> {
    // initialize empty room state
    state = new GameState("game");
    maxClients = 4;
    config: Config;

    public _navmesh: Navmesh;

    // Colyseus will invoke when creating the room instance
    async onCreate(options: any) {
        Logger.info("[gameserver] creating room id: ", options.roomId);

        //
        this.roomId = options.roomId;

        //
        this.config = new Config();

        // Initialize navigation system
        this._navmesh = new Navmesh(this);
        await this._navmesh.init();

        //
        this.processMessages();

        console.log("[gameserver] random stuff");

        //Set a simulation interval that can change the state of the game
        this.setSimulationInterval((dt) => {
            this.state.update(dt);
        }, 100);
    }

    processMessages() {
        // Client message listeners:
        this.onMessage("*", (client, type, data) => {
            // debug server messages
            if (type != ServerMsg.PING) {
                console.log(client.sessionId, ServerMsg[type], data);
            }

            // get player state
            const player = this.state.players.get(client.sessionId);
            if (!player) {
                return false;
            }

            // ping pong
            if (type === ServerMsg.PING) {
                client.send(ServerMsg.PONG, data);
            }

            // player move
            if (type === ServerMsg.PLAYER_MOVE) {
                player.move(data.h, data.v, data.seq);
            }
        });
    }

    // called every time before a user joins the roomn
    onAuth(client, options, context) {
        Logger.info("[gameserver] player auth", options);
        return options;
    }

    // When client successfully join the room
    onJoin(client: Client, options: any, auth: any) {
        Logger.info("[gameserver] player connected ", this.roomId);

        const player = new PlayerSchema(auth, client, this);

        client.view = new StateView();

        this.state.players.set(client.sessionId, player);

        client.view.add(player);
    }

    // called every time a client leaves
    onLeave(client: Client, consented: boolean) {
        Logger.info("[gameserver] player leaving", this.roomId);
        this.state.players.delete(client.sessionId);
    }

    // Cleanup callback, called after there are no more clients in the room. (see `autoDispose`)
    onDispose() {}
}
