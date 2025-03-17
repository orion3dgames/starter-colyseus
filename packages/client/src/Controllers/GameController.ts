import { Network } from "./Network";
import { Config } from "../../../shared/Config";
import { SceneName, User } from "../../../shared/types";
import { generateUserName } from "../Utils/Utils";

import maps from "../../../shared/Data/maps.json";

export class GameController {
    // core
    public engine;
    public scene;
    public client: Network;
    public config: Config;
    public canvas;

    // scene management
    public state: number = 0;
    public currentScene;
    public nextScene;

    // data
    public maps;
    public selectedMap;

    // user
    public user: User;

    // network
    public joinedRoom;

    constructor(app) {
        // core
        this.engine = app.engine;
        this.config = app.config;
        this.scene = app.scene;
        this.canvas = app.canvas;

        // create use
        this.user = {
            displayName: generateUserName(),
        };

        // create colyseus client
        this.client = new Network(app.config.port);

        // data
        this.maps = maps;
        this.selectedMap = maps.map_01; // default map
    }

    /////////////////////////////////////////
    //////////// SCENE MANAGEMENT ///////////
    /////////////////////////////////////////

    public setScene(newState: SceneName) {
        this.nextScene = newState;
    }
}
