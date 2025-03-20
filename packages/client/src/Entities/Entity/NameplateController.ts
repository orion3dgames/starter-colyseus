import { DynamicTexture } from "@babylonjs/core/Materials/Textures/dynamicTexture";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Scene } from "@babylonjs/core/scene";
import { generateRoomId } from "../../Utils/Utils";
import { Entity } from "../Entity";

export class NameplateController {
    private _scene: Scene;
    private _entity: Entity;
    private font_size = 50;
    private font = "bold 50px Arial";

    constructor(entity: Entity) {
        this._scene = entity._scene;
        this._entity = entity;
    }

    ////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////
    /////////////////////////    HELPERS           //////////////////////////
    /////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////

    /**
     * Returns the width of a dynamic texture for the provided text
     * @param text
     * @returns
     */
    getWidthForDynamicTexture(text: string): number {
        var temp = new DynamicTexture("TempDamageTexture", 64, this._scene);
        var tmpctx = temp.getContext();
        tmpctx.font = this.font;
        var DTWidth = tmpctx.measureText(text).width + 8;
        temp.dispose();
        return DTWidth;
    }

    /**
     * Create a material with a dynamic texture the size of the provided text
     * @param height =
     * @param t_height
     * @param text
     * @returns
     */
    createMaterial(height = 0.5, t_height = 2, text = "Hello World", scale = 1) {
        // set a few vars
        let uuid = generateRoomId();
        var planeHeight = height; //Set height for plane
        var DTHeight = t_height * this.font_size; //Set height for dynamic textur
        var ratio = planeHeight / DTHeight; //Calculate ratio
        var text = "" + text; //Set text

        //Use a temporay dynamic texture to calculate the length of the text on the dynamic texture canvas
        var DTWidth = this.getWidthForDynamicTexture(text);

        //Calculate width the plane has to be
        var planeWidth = DTWidth * ratio;

        //Create dynamic texture and write the text
        var texture = new DynamicTexture("UI_Nameplate_Txt_" + uuid, { width: DTWidth, height: DTHeight }, this._scene);

        // create material
        var material = new StandardMaterial("UI_Nameplate_Mat_" + uuid, this._scene);
        material.diffuseTexture = texture;
        material.opacityTexture = texture;
        material.disableLighting = true; // dont let lighting affect the mesh
        material.emissiveColor = Color3.White(); // material to be fully "lit"

        return {
            uuid,
            planeWidth,
            planeHeight,
            texture,
            material,
        };
    }

    /**
     * Draw on dynamic texture
     * @param text
     * @param texture
     * @param color
     */
    drawDynamicTexture(text, texture, color = "#FFFFFF") {
        texture.drawText(text, null, null, this.font, color, "transparent", true);
    }

    getEntityheight(offset_y) {
        if (!this._entity._mesh.entityMesh) {
            return 1;
        }
        let extendSize = this._entity._mesh.entityMesh.getBoundingInfo().boundingBox.extendSize.y ?? 1;
        return extendSize * 2 + offset_y;
    }

    /**
     * Draw nameplate above entity
     * @param entity
     * @param offset_y
     * @returns
     */
    addNamePlate(offset_y = 0.5) {
        let text = this._entity.name;
        let entity_height = this.getEntityheight(offset_y);
        let height = 0.4;
        let t_height = 1.4;

        // else we create a unique mesh
        // todo: probably can do something better here
        let { planeWidth, planeHeight, texture, material } = this.createMaterial(height, t_height, text, this._entity.scale);
        var plane = MeshBuilder.CreatePlane(
            "namePlate_" + this._entity.name,
            { width: planeWidth, height: planeHeight, sideOrientation: Mesh.FRONTSIDE },
            this._scene
        );
        plane.parent = this._entity;
        plane.position.y = plane.position.y + entity_height;
        plane.billboardMode = Mesh.BILLBOARDMODE_ALL;
        plane.material = material;

        // draw text
        this.drawDynamicTexture(text, texture);

        return plane;
    }

    /**
     * Update Loop
     */
    update() {}
}
