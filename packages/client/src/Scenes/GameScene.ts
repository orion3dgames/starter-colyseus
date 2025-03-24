import { Scene } from "@babylonjs/core/scene";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Color4 } from "@babylonjs/core/Maths/math.color";

import { GameController } from "../Controllers/GameController";
import { SceneName, ServerMsg } from "../../../shared/types";
import { Engine } from "@babylonjs/core/Engines/engine";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { Entity } from "../Entities/Entity";
import { InterfaceController } from "../Controllers/InterfaceController";
import { DirectionalLight } from "@babylonjs/core/Lights/directionalLight";
import { ShadowGenerator } from "@babylonjs/core/Lights/Shadows/shadowGenerator";
import { getStateCallbacks } from "colyseus.js";
import { CameraController } from "../Entities/Entity/CameraController";
import { LevelGenerator } from "../Controllers/LevelGenerator";
import { NavMeshController } from "../Controllers/NavMeshController";

export class GameScene {
    public _game: GameController;
    public _scene: Scene;
    public _engine: Engine;
    public _newState: SceneName;
    public _level: LevelGenerator;
    public _navmesh: NavMeshController;
    public _interface;
    public _environment;
    public _shadow: ShadowGenerator;
    public _camera: CameraController;
    public room;
    public sessionId;
    public entities = new Map();
    public $;

    constructor() {
        this._newState = SceneName.NULL;
    }

    async createScene(game): Promise<void> {
        // app
        this._game = game;
        this._engine = this._game.engine;

        // create scene
        let scene = new Scene(this._game.engine);

        // set scene
        this._scene = scene;

        // initialize assets controller & load level
        this._game.initializeAssetController();
        await this._game._assetsCtrl.loadLevel();
        this._game.engine.displayLoadingUI();

        // load level
        this._level = new LevelGenerator(this);
        await this._level.initialize();

        // load navmesh
        this._navmesh = new NavMeshController(this);
        await this._navmesh.initialize(this._level.mesh);

        // set sky color
        this._scene.clearColor = new Color4(0.1, 0.1, 0.1, 1);

        // This creates directional light with shdaows
        var light = new DirectionalLight("dir01", new Vector3(-0.25, -1, -0.25), scene);
        light.position = new Vector3(20, 40, 20);
        light.shadowEnabled = true;

        // Shadows
        var shadowGenerator = new ShadowGenerator(1024, light);
        shadowGenerator.filter = ShadowGenerator.FILTER_PCF;
        shadowGenerator.filteringQuality = ShadowGenerator.QUALITY_HIGH;
        shadowGenerator.darkness = 0;
        this._shadow = shadowGenerator;

        // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
        var ambient = new HemisphericLight("ambient1", new Vector3(0, 2, 0), scene);
        ambient.intensity = 1;

        // setup colyseus room
        if (!this._game.joinedRoom) {
            let hash = window.location.hash.substring(1);
            this._game.joinedRoom = await this._game.network.joinOrCreate(hash, this._game.user);
        }

        // set room
        this.room = this._game.joinedRoom;
        this.sessionId = this.room.sessionId;

        // start scene
        await this.startGame();
    }

    async startGame() {
        // add interface to game
        this._interface = new InterfaceController(this._scene, this._engine, this);

        // hide loading screen
        this._game.engine.hideLoadingUI();

        //
        this.$ = getStateCallbacks(this.room);

        // colyseus callbacks
        this.$(this.room.state).players.onAdd((schema, sessionId) => {
            console.log("[SCHEMA] PLAYER ADDED", schema);
            this.entities.set(sessionId, new Entity(sessionId, this._scene, this, schema, sessionId === this.sessionId));
        });
        this.$(this.room.state).players.onRemove((schema, sessionId) => {
            console.log("[SCHEMA] PLAYER LEFT", schema);
            if (this.entities.get(sessionId)) {
                this.entities.get(sessionId).delete();
            }
            this.entities.delete(sessionId);
        });

        ////////////////////////////////////////////////////
        // main game loop
        const lastUpdates = {
            SERVER: Date.now(),
            PING: Date.now(),
        };

        this._scene.registerBeforeRender(() => {
            let delta = this._engine.getFps();
            const currentTime = Date.now();

            // game update loop
            this.entities.forEach((entity) => {
                // 60 fps
                entity.update(delta);

                // server rate
                if (currentTime - lastUpdates["SERVER"] >= 100) {
                    entity.updateServerRate(100);
                }
            });

            // reset timers for entities
            if (currentTime - lastUpdates["SERVER"] >= 100) {
                lastUpdates["SERVER"] = currentTime;
            }

            // game update loop
            if (currentTime - lastUpdates["PING"] >= 1000) {
                this.room.send(ServerMsg.PING, { date: new Date().getTime() }); // send ping to server
                lastUpdates["PING"] = currentTime;
            }
        });
    }
}
