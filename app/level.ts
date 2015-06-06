// Ŭnicode please
///<reference path="app.d.ts"/>

if (typeof module !== 'undefined') {
    _ = require('underscore');
    //assert = require('assert');
    var fs = require('fs');
    var PF = require('pathfinding');
}

module kisaragi {
    export class Level {
        width: number;
        height: number;
        data: Array<Array<TileCode>>;

        constructor() {
            this.width = -1;
            this.height = -1;
            this.data = null;
        }

        tile(x: number, y: number): TileCode {
            return this.data[y][x];
        }

        setTile(x: number, y: number, val: TileCode): boolean {
            if (x < 0 || x >= this.width) {
                return false;
            }
            if (y < 0 || y >= this.height) {
                return false;
            }
            this.data[y][x] = val;
            return true;
        }

        characterToTileCode(ch: string): TileCode {
            switch (ch.toLowerCase()) {
                case '.':
                    return TileCode.Empty;
                case 'x':
                    return TileCode.Obstacle;
                case 'u':
                    return TileCode.FloorUp;
                case 'd':
                    return TileCode.FloorDown;
                case 'l':
                    return TileCode.FloorLeft;
                case 'r':
                    return TileCode.FloorRight;
                case 't':
                    return TileCode.FloorTop;
                case 'b':
                    return TileCode.FloorBottom;
                default:
                    return TileCode.Empty;
            }
        }

        generate() {
            // TODO
            // make random level data
        }

        reset(width: number, height: number) {
            this.width = width;
            this.height = height;
            // fill empty data
            this.data = [];
            for (var y: number = 0; y < height; y += 1) {
                var line = [];
                for (var x: number = 0; x < width; x += 1) {
                    line.push(TileCode.Empty);
                }
                this.data.push(line);
            }
        }

        loadFromFile(filename: string) {
            var data: string = fs.readFileSync(filename, 'utf-8');
            var rows: string[] = data.split('\n');

            var size: string[] = rows[0].split(' ');
            this.width = parseInt(size[0], 10);
            this.height = parseInt(size[1], 10);
            rows.shift();

            this.data = [];

            for (var i: number = this.height - 1; i >= 0 ; i -= 1) {
                var cols = rows[i].split('');
                var line = [];
                for (var j: number = 0; j < this.width; j += 1) {
                    var tile = this.characterToTileCode(cols[j]);
                    line.push(tile);
                }
                this.data.push(line);
            }
        }

        loadFromLevelData(levelData: string[]) {
            this.height = levelData.length;
            this.width = levelData[0].length;
            this.data = [];

            for (var i: number = this.height - 1; i >= 0 ; i -= 1) {
                var cols = levelData[i].split('');
                var line = [];
                for (var j: number = 0; j < this.width; j += 1) {
                    var tile = this.characterToTileCode(cols[j]);
                    line.push(tile);
                }
                this.data.push(line);
            }
        }

        getObstacles(): Coord[] {
            var obstacles: Coord[] = [];
            for (var y: number = 0; y < this.height; y += 1) {
                for (var x: number = 0; x < this.width; x += 1) {
                    if (this.data[y][x] === TileCode.Obstacle) {
                        obstacles.push(new Coord(x, y));
                    }
                }
            }
            return obstacles;
        }

        createGrid(zone: Zone) {
            // static elem
            var matrix = JSON.parse(JSON.stringify(this.data));
            for (var y: number = 0; y < this.height; y += 1) {
                for (var x: number = 0; x < this.width; x += 1) {
                    if (matrix[y][x] == TileCode.Obstacle) {
                        matrix[y][x] = 1;
                    } else {
                        matrix[y][x] = 0;
                    }
                }
            }

            // dynamic elem
            var allObjectList: Entity[] = zone.entityMgr.all();
            _.each(allObjectList, (obj: Entity) => {
                matrix[obj.y][obj.x] = 1;
            });
        
            //console.log(matrix);
            var grid = new PF.Grid(matrix);
            return grid;
        }

        filterVerticalRange(y: number): number {
            return (y < 0 ? 0 : (y >= this.height ? (this.height - 1) : y));
        }
        filterHorizontalRange(x: number): number {
            return (x < 0 ? 0 : (x >= this.width ? (this.width - 1) : x));
        }
        filterPosition(x: number, y: number): number[] {
            return [
                this.filterHorizontalRange(x),
                this.filterVerticalRange(y)
            ];
        }

        isWallTile(x: number, y: number): boolean {
            return this.tile(x, y) === TileCode.Obstacle;
        }

        findPath(start_pos: Coord, target_pos: Coord, zone: Zone): Array<Coord> {
            var grid = this.createGrid(zone);
            var finder = new PF.AStarFinder();
            var rawPath = finder.findPath(start_pos.x, start_pos.y, target_pos.x, target_pos.y, grid);

            var path: Array<Coord> = [];
            _.each(rawPath, (data) => {
                path.push(new Coord(data[0], data[1]));
            });
            return path;
        }

        findNextPos(start_pos: Coord, target_pos: Coord, zone: Zone): Coord {
            var path = this.findPath(start_pos, target_pos, zone);
            if (path.length === 0) {
                return null;
            } else {
                return path[1];
            }
        }
    }
}

declare var exports: any;
if (typeof exports !== 'undefined') {
    exports.Level = kisaragi.Level;
}
