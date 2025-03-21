import { NetworkController } from "./NetworkController";
import { Config } from "../../../shared/Config";
import { SceneName, User } from "../../../shared/types";
import { generateUserName } from "../Utils/Utils";
import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { AssetsController } from "./AssetsController";
import { AssetContainer } from "@babylonjs/core/assetContainer";
import { LoadingController } from "./LoadingController";

export class GameController {
    // core
    public engine: Engine;
    public scene: Scene;
    public network: NetworkController;
    public _loading: LoadingController;
    public config: Config;
    public canvas;

    // scene management
    public state: number = 0;
    public currentScene;
    public nextScene;

    // user
    public user: User;

    // assets
    public _assetsCtrl: AssetsController;
    public _loadedAssets: AssetContainer[] = [];
    public instances = new Map();
    public materials = new Map();

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

        // create loading controller
        this._loading = new LoadingController("Loading Assets...");
        this.engine.loadingScreen = this._loading;

        // create colyseus client
        this.network = new NetworkController(app.config.port);

        //
        this.fixForAudio();
    }

    /**
     * Allow audio to be played
     */
    fixForAudio(): void {
        // fix
        window.addEventListener(
            "click",
            () => {
                Engine.audioEngine.unlock();
            },
            { once: true }
        );
    }

    /////////////////////////////////////////
    //////////// ASSETS DATA /////////////////
    /////////////////////////////////////////

    async fetchAsset(key) {
        if (this._loadedAssets[key]) {
            return this._loadedAssets[key];
        }
    }

    async initializeAssetController(shadow = null) {
        this._loadedAssets = [];
        this._assetsCtrl = new AssetsController(this, shadow);
    }

    /////////////////////////////////////////
    //////////// SCENE MANAGEMENT ///////////
    /////////////////////////////////////////

    public setScene(newState: SceneName) {
        this.nextScene = newState;
    }
}
