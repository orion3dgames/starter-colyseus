import { Schema, MapSchema, type } from "@colyseus/schema";
import { PlayerSchema } from "./PlayerSchema";
import { GiftSchema } from "./GiftSchema";
import { randomUUID } from "crypto";

export class GameState extends Schema {
    @type({ map: PlayerSchema }) players = new MapSchema<PlayerSchema>();
    @type({ map: GiftSchema }) gifts = new MapSchema<GiftSchema>();

    public spawnPositions = [
        { x: 0, y: 0, z: 2, used: false },
        { x: 0, y: 0, z: -2, used: false },
        { x: 2, y: 0, z: 0, used: false },
        { x: -2, y: 0, z: 0, used: false },
    ];

    constructor(args) {
        super();
    }

    spawnGifts() {
        // check if available space
        let freeSpot: any = false;
        this.spawnPositions.forEach((element) => {
            if (!element.used && !freeSpot) {
                element.used = true;
                freeSpot = element;
            }
        });

        if (freeSpot) {
            const gift = new GiftSchema(this, freeSpot);
            this.gifts.set(randomUUID(), gift);
            console.log("SPAWNED A GIFT AT POSITION", freeSpot);
        }
    }

    public update(dt) {
        // keep spawning gifts
        this.spawnGifts();

        // update players
        this.players.forEach((entity) => {
            entity.update(dt);
        });
    }
}
