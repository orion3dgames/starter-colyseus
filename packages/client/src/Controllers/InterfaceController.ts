import { Scene } from "@babylonjs/core/scene";
import { AdvancedDynamicTexture } from "@babylonjs/gui/2D/advancedDynamicTexture";
import { DebugBox } from "./UI/DebugBox";
import { Engine } from "@babylonjs/core/Engines/engine";
import { GameScene } from "../Scenes/GameScene";
import { GameController } from "./GameController";
import { Button } from "@babylonjs/gui/2D/controls/button";
import { Control } from "@babylonjs/gui/2D/controls/control";
import { Entity } from "../Entities/Entity";
import { ServerMsg } from "../../../shared/types";
import { NavmeshBox } from "./UI/NavmeshBox";
import { Screenshot } from "./UI/Screenshot";

export class InterfaceController {
    public _scene: Scene;
    public _engine: Engine;
    public _game: GameController;
    public _entities: Map<number, Entity>;
    public _room;

    // ui layers
    public _backLayer: AdvancedDynamicTexture;
    public _mainLayer: AdvancedDynamicTexture;
    public _frontLayer: AdvancedDynamicTexture;

    // ui controllers
    public _DebugBox: DebugBox;
    public _NavmeshBox: NavmeshBox;
    public _Screenshot: Screenshot;

    // vars
    public ping: number = 0;
    public currentPlayer: Entity;

    constructor(scene: Scene, engine: Engine, gameScene: GameScene) {
        this._scene = scene;
        this._engine = engine;
        this._game = gameScene._game;
        this._entities = gameScene.entities;
        this._room = gameScene._game.joinedRoom;

        // create adt
        this._backLayer = AdvancedDynamicTexture.CreateFullscreenUI("UI_BackLayer", true, this._scene);
        this._mainLayer = AdvancedDynamicTexture.CreateFullscreenUI("UI_MainLayer", true, this._scene);
        this._frontLayer = AdvancedDynamicTexture.CreateFullscreenUI("UI_FrontLayer", true, this._scene);

        // on pong
        this._room.onMessage(ServerMsg.PONG, (data) => {
            let dateNow = Date.now();
            this.ping = dateNow - data.date;
        });
    }

    update() {
        this._DebugBox.update();
    }

    setCurrentPlayer(entity: Entity) {
        this.currentPlayer = entity;
        this._DebugBox = new DebugBox(this, entity);
        this._Screenshot = new Screenshot(this, entity);
        this._NavmeshBox = new NavmeshBox(this, entity);
    }
}
