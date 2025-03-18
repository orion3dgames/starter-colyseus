import { StateView } from "@colyseus/schema";
import { Room, Client } from "@colyseus/core";
import Logger from "../../../shared/Utils/Logger";
import { Config } from "../../../shared/Config";
import { ServerMsg } from "../../../shared/types";
import { GameState } from "../schemas/GameState";
import { Player } from "../entities/player";

export class GameRoom extends Room<GameState> {
    // initialize empty room state
    state = new GameState("game");
    maxClients = 4;
    config: Config;
    players: Map<string, Player> = new Map();

    // Colyseus will invoke when creating the room instance
    onCreate(options: any) {
        Logger.info("[gameserver] creating room id: ", options.roomId);

        //
        this.roomId = options.roomId;

        //
        this.config = new Config();

        //
        this.processMessages();

        //Set a simulation interval that can change the state of the game
        this.setSimulationInterval((dt) => {
            this.players.forEach((player) => {
                player.update(dt);
            });
        }, 1000);
    }

    public update(dt) {
        // update players
        this.players.forEach((entity) => {
            entity.update(dt);
        });
    }

    processMessages() {
        // Client message listeners:
        this.onMessage("*", (client, type, data) => {
            // debug server messages
            if (type != ServerMsg.PING) {
                console.log(client.sessionId, ServerMsg[type], data);
            }

            // get player state
            const player = this.players.get(client.sessionId);
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

        const player = new Player(auth, client, this);

        this.players.set(client.sessionId, player);
    }

    // called every time a client leaves
    onLeave(client: Client, consented: boolean) {
        Logger.info("[gameserver] player leaving", this.roomId);
        // delete the schema
        const playerState = this.players.get(client.sessionId);
        playerState.delete();

        // delete the player
        this.players.delete(client.sessionId);
    }

    // Cleanup callback, called after there are no more clients in the room. (see `autoDispose`)
    onDispose() {}
}
