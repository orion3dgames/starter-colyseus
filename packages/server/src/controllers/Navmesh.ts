import { GameRoom } from "../rooms/GameRoom";
import { loadNavMeshFromFile } from "../utils/Utils";

//import * as recast from "recast-navigation";
import { init, NavMesh, NavMeshQuery } from "recast-navigation";

export class Navmesh {
    public _recast;
    public _navmesh: NavMesh;
    public _query: NavMeshQuery;

    constructor(gameroom: GameRoom) {}

    async init() {
        // Initialize navigation system
        await init();
        this._navmesh = await loadNavMeshFromFile("level");
        this._query = new NavMeshQuery(this._navmesh);
    }

    findRandomPoint() {
        const position = { x: 0, y: 0, z: 0 }; // Set to the starting position of the agent.
        const radius = 20;
        const { success, status, randomPolyRef, randomPoint } = this._query.findRandomPoint(position);
        console.log("findRandomPoint", randomPoint);
    }
}
