///////////////////////////////////////////////////////////
// CAPTAIN OBVIOUS HERE:
// this can only be used in a NODE ENVIRONMENT, do not use to import in the client as fs is not available
import { importNavMesh } from "recast-navigation";
import fs from "fs";
import path from "path";

export async function loadNavMeshFromFile(fileNameNavMesh: string): Promise<any> {
    const url = path.join(__dirname, "../../../../assets/models/level/" + fileNameNavMesh + ".bin");
    const navMeshExport = await fs.readFileSync(url);
    const arr = new Uint8Array(navMeshExport);
    const { navMesh } = await importNavMesh(arr);
    return navMesh;
}
