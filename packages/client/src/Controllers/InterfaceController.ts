import { Scene } from "@babylonjs/core/scene";
import { AdvancedDynamicTexture } from "@babylonjs/gui/2D/advancedDynamicTexture";
import { DebugBox } from "./UI/DebugBox";
import { Engine } from "@babylonjs/core/Engines/engine";
import { Rectangle } from "@babylonjs/gui/2D/controls/rectangle";
import { TextBlock, TextWrapping } from "@babylonjs/gui/2D/controls/textBlock";
import { GameScene } from "../Scenes/GameScene";
import { GameController } from "./GameController";
import { Button } from "@babylonjs/gui/2D/controls/button";
import { Control } from "@babylonjs/gui/2D/controls/control";

export class InterfaceController {
    public _scene: Scene;
    private _engine: Engine;
    public _game: GameController;
    public _entities;
    public _room;
    public _currentPlayer;

    public _ui: AdvancedDynamicTexture;
    public _uiLabels: AdvancedDynamicTexture;

    public _DebugBox: DebugBox;

    constructor(scene, engine, gameScene: GameScene) {
        this._scene = scene;
        this._engine = engine;
        this._game = gameScene._game;
        this._entities = gameScene.entities;
        this._room = gameScene._game.joinedRoom;

        // create ui
        this._uiLabels = AdvancedDynamicTexture.CreateFullscreenUI("UI_Names", true, this._scene);

        // create adt
        this._ui = AdvancedDynamicTexture.CreateFullscreenUI("UI_Player", true, this._scene);

        // create base ui
        this.create(gameScene);
    }

    update() {
        console.log();
        this._DebugBox.update();
    }

    setCurrentPlayer(entity) {
        this._DebugBox = new DebugBox(this, entity);
    }

    create(gameScene) {
        const reviveButton = Button.CreateSimpleButton("reviveButton", "TOGGLE SERVER MOVEMENT");
        reviveButton.top = "15px;";
        reviveButton.left = "15px;";
        reviveButton.width = "250px;";
        reviveButton.height = "45px";
        reviveButton.color = "white";
        reviveButton.background = "#000";
        reviveButton.thickness = 1;
        reviveButton.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        reviveButton.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        this._ui.addControl(reviveButton);

        reviveButton.onPointerDownObservable.add(() => {
            this._game.activateServerMovement = !this._game.activateServerMovement;
            console.log(this._game.activateServerMovement);
        });
    }
}
