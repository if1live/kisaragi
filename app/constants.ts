// Ŭnicode please
///<reference path="app.d.ts"/>
module kisaragi {
    export var HTTP_PORT: number = 8001;
    export var TARGET_FPS = 60;

    export var COOLTIME_MOVE: number = 0.1;

    // for architecture
    export enum GamePlayMode {
        SinglePlay,
        MultiPlay,
    }

    // for server

    // for client
    export var TILE_SIZE = 32;
    export var ASSET_PATH = '/static/assets/';

    export var GROUND_DEPTH = 1;
    export var CHARACTER_DEPTH = 2;

    export enum Role {
        Server,
        Client
    };

    export enum Category {
        Enemy,
        Player,
        Item,
    };

    // tile = static level data
    export enum TileCode {
        Empty,
        Obstacle,
        FloorUp,
        FloorDown,
        FloorLeft,
        FloorRight,
        FloorTop,
        FloorBottom,
        LevelStart,
        LevelGoal,
    }

    export var MOVABLIE_TILE_LIST = [
        TileCode.Empty,
        TileCode.FloorUp,
        TileCode.FloorDown,
        TileCode.FloorLeft,
        TileCode.FloorRight,
        TileCode.FloorTop,
        TileCode.FloorBottom,
        TileCode.LevelStart,
        TileCode.LevelGoal,
    ];
}

declare var exports: any;
if (typeof exports !== 'undefined') {
    exports.HTTP_PORT = kisaragi.HTTP_PORT;
    exports.TARGET_FPS = kisaragi.TARGET_FPS;
    exports.COOLTIME_MOVE = kisaragi.COOLTIME_MOVE;
    exports.TILE_SIZE = kisaragi.TILE_SIZE;
    exports.ASSET_PATH = kisaragi.ASSET_PATH;

    exports.GamePlayMode = kisaragi.GamePlayMode;

    exports.Role = kisaragi.Role;
    exports.Category = kisaragi.Category;
    exports.TileCode = kisaragi.TileCode;
}
