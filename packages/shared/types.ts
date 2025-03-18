///////////////////////////////
///////////////////////////////
///////////////////////////////

export enum SceneName {
    NULL = 0,
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
    PLAYER_MOVE,
}

export type PlayerInputs = {
    seq: number;
    h: number;
    v: number;
};
