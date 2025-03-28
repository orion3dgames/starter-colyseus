import { StateView } from "@colyseus/schema";
import { Room, Client } from "@colyseus/core";
import Logger from "../../../shared/Utils/Logger";
import Config from "../../../shared/Config";
import { ServerMsg } from "../../../shared/src";
import { GameState } from "../schemas/GameState";
import { PlayerSchema } from "../schemas/PlayerSchema";
import { promises as fs } from "fs";
import { init } from "@recast-navigation/core";

async function loadMonoCounter() {
    const data = await fs.readFile("../../assets/models/level/level.bin", "binary");
    return Buffer.from(data);
}

export class GameRoom extends Room<GameState> {
    // initialize empty room state
    state = new GameState("game");
    maxClients = 4;
    config: Config;

    // navmesh
    _recast;
    _navmesh;

    // Colyseus will invoke when creating the room instance
    async onCreate(options: any) {
        Logger.info("[gameserver] creating room id: ", options.roomId);

        //
        this.roomId = options.roomId;

        //
        this.config = new Config();

        //
        this._recast = await init();
        /*
        const array = await loadMonoCounter();
        const arr = new Uint8Array(array);
        const { navMesh } = importNavMesh(arr);
        this._navmesh = navMesh;*/

        //
        this.processMessages();

        //Set a simulation interval that can change the state of the game
        this.setSimulationInterval((dt) => {
            this.state.update(dt);
        }, 1000);
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
