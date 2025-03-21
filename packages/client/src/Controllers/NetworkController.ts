// colyseus
import { Client } from "colyseus.js";
import { isLocal } from "../Utils/Utils";
import axios from "axios";

export class NetworkController {
    public _client: Client;
    public port = 3000;

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
        this.port = port;
    }

    public async requestRooms(hash) {
        let url = window.location.hostname;
        if (isLocal()) {
            url = window.location.hostname + ":" + this.port;
        }
        const response = await axios.get("/rooms/?roomName=" + hash);
        console.log("[requestRooms]", response);
        if (response && response.data && response.data.roomsById && response.data.roomsById.length > 0 && response.data.roomsById[hash]) {
            return response.data.roomsById[hash];
        }
        return false;
    }

    public async joinOrCreate(hash, user): Promise<any> {
        // if hash is empty
        if (!hash) {
            hash = "ABCD";
        }

        // get all rooms
        let foundRoom = await this.requestRooms(hash);
        console.log("[joinOrCreate] found room ?", foundRoom);

        // if room doesn't exist, create it
        if (!foundRoom) {
            console.log("Room does not exist", hash);
            return await this._client.create("gameroom", { roomId: hash, user: user });
        }

        // make sure room is not already full
        if (foundRoom.clients == foundRoom.maxClients) {
            console.error("Room is full, no entry!");
            return false;
        }

        // else join it;
        console.log("room already exists, joining in progress... ", foundRoom);
        return await this._client.joinById(hash, { user: user });
    }
}
