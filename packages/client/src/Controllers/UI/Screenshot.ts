import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { Entity } from "../../Entities/Entity";
import { InterfaceController } from "../InterfaceController";
import { Room } from "colyseus.js";
import { StackPanel } from "@babylonjs/gui/2D/controls/stackPanel";
import { Control } from "@babylonjs/gui/2D/controls/control";
import { Slider } from "@babylonjs/gui/2D/controls/sliders/slider";
import { TextBlock } from "@babylonjs/gui/2D/controls/textBlock";
import { Button } from "@babylonjs/gui/2D/controls/button";
import { Tools } from "@babylonjs/core/Misc/tools";

export class Screenshot {
    private _ui: InterfaceController;

    constructor(playerUI: InterfaceController, entity: Entity) {
        this._ui = playerUI;

        // create UI
        this._createUI();
    }

    _createUI() {
        const simpleButton = Button.CreateSimpleButton("simpleButton", "Screenshot");
        simpleButton.width = "150px;";
        simpleButton.height = "30px";
        simpleButton.left = "15px";
        simpleButton.top = "15px";
        simpleButton.color = "white";
        simpleButton.background = "#000";
        simpleButton.thickness = 1;
        simpleButton.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        simpleButton.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        this._ui._mainLayer.addControl(simpleButton);

        simpleButton.onPointerDownObservable.add(() => {
            this.takeScreenshot();
        });
    }

    takeScreenshot() {
        Tools.CreateScreenshot(
            this._ui._engine,
            this._ui.currentPlayer._camera.camera,
            { width: 2560, height: 1440, precision: 0.9 },
            () => {
                console.log("Screnshot taken!");
            },
            "image/jpeg",
            true,
            0.9
        );
    }

    // debug panel refresh
    public update() {}
}
