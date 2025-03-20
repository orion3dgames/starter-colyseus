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

    // vars
    public ping: number = 0;

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

        // debug button
        this.createDebug();

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
        this._DebugBox = new DebugBox(this, entity);
    }

    createDebug() {
        const simpleButton = Button.CreateSimpleButton("simpleButton", "TOGGLE SERVER MOVEMENT");
        simpleButton.top = "15px;";
        simpleButton.left = "15px;";
        simpleButton.width = "250px;";
        simpleButton.height = "45px";
        simpleButton.color = "white";
        simpleButton.background = "#000";
        simpleButton.thickness = 1;
        simpleButton.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        simpleButton.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        this._mainLayer.addControl(simpleButton);

        simpleButton.onPointerDownObservable.add(() => {
            this._game.activateServerMovement = !this._game.activateServerMovement;
        });
    }
}
