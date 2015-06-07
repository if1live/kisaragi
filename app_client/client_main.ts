// Ŭnicode please
/// <reference path="app_client.d.ts" />

module kisaragi {
    var width = 640;
    var height = 480;

    export class ClientMain extends Phaser.Game {
        playMode: GamePlayMode;

        constructor(playMode: GamePlayMode) {
            super(width, height, Phaser.AUTO, 'phaser-example', null);
            this.playMode = playMode;

            this.state.add('MainState', MainState, false);
            this.state.start('MainState');

        }
    }
}