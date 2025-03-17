// colyseus
import { Client, Room } from "colyseus.js";
import { isLocal } from "../Utils/Utils";

export class Network {
    public _client: Client;

    constructor(port) {
        // create colyseus client
        let url = "wss://" + window.location.hostname;
        if (isLocal()) {
            url = "ws://localhost:" + port;
        }
        let options = {
            hostname: url,
            secure: false,
            port: port,
        };
        this._client = new Client(url);
    }

    public async joinOrCreate(hash, user): Promise<any> {
        // if hash is empty
        if (!hash) {
            hash = "ABCD";
        }

        // get all rooms;
        let rooms = await this._client.http.get("/rooms/?roomName=" + hash);
        let foundRoom = rooms.data.roomsById[hash];

        // if room doesn't exist, create it
        if (!foundRoom) {
            return await this._client.create("gameroom", { roomId: hash, user: user });
        }

        // make sure room is not already full
        if (foundRoom.clients == foundRoom.maxClients) {
            console.error("Room is full, no entry!");
            return false;
        }

        // else join it;
        console.log("room already exists ", rooms.data.roomsById[hash]);
        return await this._client.joinById(hash, { user: user });
    }
}
