import RAPIER from "@dimforge/rapier3d-compat-simd";

const addColliderToMesh = function (object) {
    // RAPIER physics always uses quaternions.
    // https://rapier.rs/docs/user_guides/javascript/rigid_bodies
    object.computeWorldMatrix(true);
    let groundRotQ = object.absoluteRotationQuaternion.clone();
    console.log(groundRotQ);

    /*
    Rapier cuboid is defined as width, height, and depth.
    Babylon bounding boxes are all vertices.
    I tried to use the advice in this thread to convert:
    https://forum.babylonjs.com/t/get-total-size-of-parent-mesh/9285
    */
    let groundSizes = object.getHierarchyBoundingVectors();
    let collideSize = {
        x: groundSizes.max.x - groundSizes.min.x,
        y: groundSizes.max.y - groundSizes.min.y,
        z: groundSizes.max.z - groundSizes.min.z,
    };

    let groundColliderDesc = RAPIER.ColliderDesc.cuboid(collideSize.x / 2, collideSize.y / 2, collideSize.z / 2);
    groundColliderDesc.setTranslation(
        (groundSizes.min.x + groundSizes.max.x) / 2,
        (groundSizes.min.y + groundSizes.max.y) / 2,
        (groundSizes.min.z + groundSizes.max.z) / 2
    );
    groundColliderDesc.setRotation({
        x: groundRotQ.x,
        y: groundRotQ.y,
        z: groundRotQ.z,
        w: groundRotQ.w,
    });
};

export { addColliderToMesh };
