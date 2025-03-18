import { StateView } from "@colyseus/schema";
import { Room, Client } from "@colyseus/core";
import Logger from "../../../shared/Utils/Logger";
import { Config } from "../../../shared/Config";
import { ServerMsg } from "../../../shared/types";
import { GameState } from "../schemas/GameState";
import { Player } from "../schemas/Player";

export class GameRoom extends Room<GameState> {
    // initialize empty room state
    state = new GameState("game");
    maxClients = 4;
    config: Config;

    // Colyseus will invoke when creating the room instance
    onCreate(options: any) {
        Logger.info("[gameserver] creating room id: ", options.roomId);

        //
        this.roomId = options.roomId;

        //
        this.config = new Config();

        //
        this.processMessages();
    }

    processMessages() {
        // Client message listeners:
        this.onMessage("*", (client, type, data) => {
            ////////////////////////////////////
            ////////// PLAYER EVENTS ///////////
            ////////////////////////////////////
            const playerState: Player = this.state.players.get(client.sessionId) as Player;
            if (!playerState) {
                return false;
            }

            if (type === ServerMsg.PING) {
                client.send(ServerMsg.PONG, data);
            }

            if (type === ServerMsg.PLAYER_MOVE) {
                console.log(ServerMsg[ServerMsg.PLAYER_MOVE], data);
                playerState.move(data.h, data.v, data.seq);
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

        const player = new Player(auth, this);

        client.view = new StateView();
        client.view.add(player);

        this.state.players.set(client.sessionId, player);
    }

    // called every time a client leaves
    onLeave(client: Client, consented: boolean) {
        Logger.info("[gameserver] player leaving", this.roomId);
        this.state.players.delete(client.sessionId);
    }

    // Cleanup callback, called after there are no more clients in the room. (see `autoDispose`)
    onDispose() {}
}
