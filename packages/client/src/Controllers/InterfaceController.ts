import { Scene } from "@babylonjs/core/scene";
import { AdvancedDynamicTexture } from "@babylonjs/gui/2D/advancedDynamicTexture";
import { DebugBox } from "./UI/DebugBox";
import { Engine } from "@babylonjs/core/Engines/engine";
import { Rectangle } from "@babylonjs/gui/2D/controls/rectangle";
import { TextBlock, TextWrapping } from "@babylonjs/gui/2D/controls/textBlock";
import { GameScene } from "../Scenes/GameScene";
import { GameController } from "./GameController";

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

    create(gameScene) {}
}
