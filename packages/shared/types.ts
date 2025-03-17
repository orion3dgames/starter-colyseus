///////////////////////////////
///////////////////////////////
///////////////////////////////

interface ITileItem {
    id: number;
    animated: boolean;
    sprite: string;
    frames: number;
    physics: boolean;
    explosivable: boolean;
    isPlayer: boolean;
    isEnemy: boolean;
}

export type Tile = {
    id: string;
    name: string;
    width: number;
    height: number;
    isWalkable?: boolean;
    offset_y?: number; // vertical offset
};

export interface ITiles {
    [key: string]: Tile;
}

export enum CellType {
    GROUND = "ground",
    SPAWNPOINT = "spawnpoint",
    WALL = "wall",
    BREAKABLE_WALL = "breakable_wall",
    EXPLOSION = "explosion",
    PLAYER = "player",
    BOMB = "bomb",
    POWER_UP = "power_up",
}

export enum PowerUpTypes {
    HEALTH = 0,
    BOMB,
    SPEED,
}

///////////////////////////////
///////////////////////////////
///////////////////////////////

export enum SceneName {
    NULL = 0,
    HOME,
    ROOM,
    GAME,
}

///////////////////////////////
///////////////////////////////
///////////////////////////////

export type User = {
    displayName: string;
};

///////////////////////////////
///////////////////////////////
///////////////////////////////

export enum ServerMsg {
    PING = 1,
    PONG,
    START_GAME,
    START_MAP_UPDATE,
    START_GAME_REQUESTED,
    PLAYER_MOVE,
    PLACE_BOMB,
    DO_EXPLOSION,
}

export type PlayerInputs = {
    seq: number;
    h: number;
    v: number;
};

export enum ServerStatus {
    CREATED = 1,
    STARTED,
    FINISHED,
}
