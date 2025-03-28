// colyseus
import { Client } from "colyseus.js";
import { isLocal } from "../Utils/Utils";
import Debugger from "../Utils/Debugger";

export class NetworkController {
    public _client: Client;
    public port;
    public room;

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

        this._client = new Client(options.hostname);
        this.port = port;
    }

    public async joinOrCreate(hash, user): Promise<any> {
        // if hash is empty
        if (!hash) {
            hash = "ABCD";
        }

        // get all rooms to check if it already exists
        let url = "/rooms/?roomName=" + hash;
        let rooms = await this._client.http.get(url);
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
            Debugger.log("NETWORK", "room does not exist, let's create a new one", { roomId: hash, user: user });
            return await this._client.create("gameroom", { roomId: hash, user: user });
        }

        // make sure room is not already full
        if (foundRoom.clients == foundRoom.maxClients) {
            Debugger.warn("NETWORK", "room is full, no entry", foundRoom);
            return false;
        }

        // else join it;
        Debugger.log("NETWORK", "room already exists, joining existing room", foundRoom);
        return await this._client.joinById(hash, { user: user });
    }
}
