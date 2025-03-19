import { Schema, MapSchema, type } from "@colyseus/schema";
import { PlayerSchema } from "./PlayerSchema";

export class GameState extends Schema {
    @type({ map: PlayerSchema }) players = new MapSchema<PlayerSchema>();

    constructor(args) {
        super();
    }

    public update(dt) {
        // update players
        this.players.forEach((entity) => {
            entity.update(dt);
        });
    }
}
