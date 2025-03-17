import { Button } from "@babylonjs/gui/2D/controls/button";
import { Container } from "@babylonjs/gui/2D/controls/container";
import { Control } from "@babylonjs/gui/2D/controls/control";
import { StackPanel } from "@babylonjs/gui/2D/controls/stackPanel";

export class MenuOptions {
    height;
    color: any;
    background: any;
    container: any;
    button: any;
    options: any;
    control: any;

    constructor(advancedTexture, options: any = {}) {
        let width = (options.width || 180) + "px";
        this.height = (options.height || 40) + "px";
        this.color = options.color || "black";
        this.background = options.background || "white";
        this.control = advancedTexture;

        // Container
        this.container = new Container();
        this.container.width = width;
        this.container.verticalAlignment = options.align || Control.VERTICAL_ALIGNMENT_TOP;
        this.container.horizontalAlignment = options.valign || Control.HORIZONTAL_ALIGNMENT_LEFT;
        this.container.isHitTestVisible = false;

        // Primary button
        this.button = Button.CreateSimpleButton(null, "Please Select");
        this.button.height = this.height;
        this.button.background = this.background;
        this.button.color = this.color;
        this.button.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;

        // Options panel
        this.options = new StackPanel();
        this.options.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        this.options.top = this.height;
        this.options.isVisible = false;
        this.options.isVertical = true;

        this.button.onPointerUpObservable.add(() => {
            this.options.isVisible = !this.options.isVisible;
        });

        this.container.onPointerEnterObservable.add(() => {
            this.container.zIndex = 555; //some big value
        });

        this.container.onPointerOutObservable.add(() => {
            this.container.zIndex = 0; //back to original
            this.options.isVisible = false;
        });

        // add controls
        this.control.addControl(this.container);
        this.container.addControl(this.button);
        this.container.addControl(this.options);

        console.log(this.control);
    }

    get top() {
        return this.container.top;
    }

    set top(value) {
        this.container.top = value;
    }

    get left() {
        return this.container.left;
    }

    set left(value) {
        this.container.left = value;
    }

    addOption(text, callback) {
        var button = Button.CreateSimpleButton(null, text);
        button.height = this.height;
        button.paddingTop = "-1px";
        button.background = this.background;
        button.color = this.color;
        button.alpha = 1.0;
        button.onPointerUpObservable.add(() => {
            this.options.isVisible = false;
        });
        button.onPointerClickObservable.add(callback);
        this.options.addControl(button);
    }
}
