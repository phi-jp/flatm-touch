/*
 * main.js
 */

/*
 * contant
 */
var SCREEN_WIDTH    = 680;              // スクリーン幅
var SCREEN_HEIGHT   = 960;              // スクリーン高さ
var SCREEN_CENTER_X = SCREEN_WIDTH/2;   // スクリーン幅の半分
var SCREEN_CENTER_Y = SCREEN_HEIGHT/2;  // スクリーン高さの半分

/*
 * main
 */
tm.main(function() {
    // アプリケーションセットアップ
    var app = tm.app.CanvasApp("#world");       // 生成
    app.resize(SCREEN_WIDTH, SCREEN_HEIGHT);    // サイズ(解像度)設定
    app.fitWindow();                            // 自動フィッティング有効
    app.background = "rgba(250, 250, 250, 1.0)";// 背景色

    app.replaceScene( GameScene() );    // シーン切り替え

    // 実行
    app.run();
});

/*
 * ゲームシーン
 */
tm.define("GameScene", {
    superClass: "tm.app.Scene",

    init: function() {
        this.superInit();
    },
});


