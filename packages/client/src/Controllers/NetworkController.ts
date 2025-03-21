// colyseus
import { Client } from "colyseus.js";
import { isLocal } from "../Utils/Utils";
import axios from "axios";

export class NetworkController {
    public _client: Client;
    public port = 3000;

    constructor(port) {
        let url = "wss://" + window.location.hostname;
        let options = {
            hostname: url,
            secure: false,
            port: port,
        } as any;

        // create colyseus client
        if (isLocal()) {
            url = "ws://localhost:" + port;
            options = {
                hostname: url,
                secure: false,
                port: port,
            };
        }

        this._client = new Client(options.url);
        this.port = port;

        console.log(options);
    }

    public async requestRooms(hash) {
        let url = window.location.hostname;
        if (isLocal()) {
            url = window.location.hostname + ":" + this.port;
        }
        const response = await axios.get("/rooms/?roomName=" + hash);
        console.log("[requestRooms]", response);
        if (response && response.data && response.data.length > 0) {
            let found = false;
            for (let i = 0; i < response.data.length; i++) {
                let room = response.data[i];
                if (room.roomId === hash) {
                    found = room;
                    break;
                }
            }
            return found;
        }
        return false;
    }

    public async joinOrCreate(hash, user): Promise<any> {
        // if hash is empty
        if (!hash) {
            hash = "ABCD";
        }

        // get all rooms;
        let rooms = await this._client.http.get("/rooms/?roomName=" + hash);
        console.log(rooms);
        let foundRoom = false as any;
        if (rooms.data && rooms.data.length > 0) {
            for (let i = 0; i < rooms.data.length; i++) {
                let room = rooms.data[i];
                if (room.roomId === hash) {
                    foundRoom = room;
                    break;
                }
            }
        }

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
        console.log("room already exists ", foundRoom);
        return await this._client.joinById(hash, { user: user });
    }
}
