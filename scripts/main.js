/*
 * main.js
 */

/*
 * contant
 */
var SCREEN_WIDTH    = 640;              // スクリーン幅
var SCREEN_HEIGHT   = 960;              // スクリーン高さ
var SCREEN_CENTER_X = SCREEN_WIDTH/2;   // スクリーン幅の半分
var SCREEN_CENTER_Y = SCREEN_HEIGHT/2;  // スクリーン高さの半分

var PIECE_NUM_X     = 5;                // ピースの列数
var PIECE_NUM_Y     = 5;                // ピースの行数
var PIECE_NUM       = PIECE_NUM_X*PIECE_NUM_Y;  // ピース数
var PIECE_OFFSET_X  = 90;               // ピースオフセットX　
var PIECE_OFFSET_Y  = 240;              // ピースオフセットY
var PIECE_WIDTH     = 110;              // ピースの幅
var PIECE_HEIGHT    = 110;              // ピースの高さ

var FONT_FAMILY_FLAT= "'Helvetica-Light' 'Meiryo' sans-serif";  // フラットデザイン用フォント

// アセット
var ASSETS = {
    "bgm": "sounds/bgm.mp3",
    "pinponSE": "sounds/pinpon.mp3",
    "booSE": "sounds/boo.mp3",
    "clearSE": "sounds/clear.mp3",
};

/*
 * main
 */
tm.main(function() {
    // アプリケーションセットアップ
    var app = tm.app.CanvasApp("#world");       // 生成
    app.resize(SCREEN_WIDTH, SCREEN_HEIGHT);    // サイズ(解像度)設定
    app.fitWindow();                            // 自動フィッティング有効
    app.background = "rgba(250, 250, 250, 1.0)";// 背景色

    // ローディング
    var loading = tm.scene.LoadingScene({
        width: SCREEN_WIDTH,    // 幅
        height: SCREEN_HEIGHT,  // 高さ
        assets: ASSETS,         // アセット
    });
    app.replaceScene( loading );    // シーン切り替え

    loading.onload = function() {
        app.replaceScene(MainScene());
    };

    // 実行
    app.run();
});

tm.define("MainScene", {
    superClass: "tm.scene.ManagerScene",

    init: function() {
        this.superInit({
            scenes: [
                {
                    className: "tm.scene.TitleScene",
                    arguments: {
                        title: "FlaTM Touch",
                    },
                    label: "title",
                },
                {
                    className: "GameScene",
                    arguments: {
                    },
                    label: "game",
                },
                {
                    className: "tm.scene.ResultScene",
                    arguments: {
                        score: 0,
                    },
                    nextLabel: "title",
                },
            ]
        });
    },
});

/*
 * ゲームシーン
 */
tm.define("GameScene", {
    superClass: "tm.app.Scene",

    init: function() {
        this.superInit();
        // bgm 再生
        tm.asset.AssetManager.get("bgm").play();

        var self = this;

        // カレント数
        self.currentNumber = 1;

        // ピースグループ
        this.pieceGroup = tm.app.CanvasElement();
        this.addChild(this.pieceGroup);

        // 数字配列
        var nums = [].range(1, PIECE_NUM+1);  // 1~25
        nums.shuffle(); // シャッフル

        // ピースを作成
        for (var i=0; i<PIECE_NUM_Y; ++i) {
            for (var j=0; j<PIECE_NUM_X; ++j) {
                // 数値
                var number = nums[ i*PIECE_NUM_X+j ];
                // ピースを生成してピースグループに追加
                var piece = Piece(number).addChildTo(this.pieceGroup);
                // 座標を設定
                piece.x = j * 115 + PIECE_OFFSET_X;
                piece.y = i * 115 + PIECE_OFFSET_Y;
                // タッチ時のイベントリスナーを登録
                piece.onpointingstart = function() {
                    // 正解かどうかの判定
                    if (this.number === self.currentNumber) {
                        // クリアかどうかの判定
                        if (self.currentNumber === PIECE_NUM) {
                            // 次のシーンへ
                            var score = Math.max(60-Number(self.timerLabel.text), 0)*100;
                            self.nextArguments = {
                                score   : score.floor(),
                                message : "tmlib.js チュートリアルゲームです. Time: {0}".format(self.timerLabel.text),
                                hashtags: "tmlib,javascript,game",
                                url     : "http://phi-jp.github.io/tmlib.js/", // or window.document.location.href
                            };
                            self.app.popScene();

                            // クリア SE 再生
                            tm.asset.AssetManager.get("clearSE").clone().play();
                        }
                        // 正解 SE 再生
                        tm.asset.AssetManager.get("pinponSE").clone().play();
                        self.currentNumber += 1;// インクリメント
                        this.disable();         // ボタン無効
                    }
                    else {
                        // 不正解 SE 再生
                        tm.asset.AssetManager.get("booSE").clone().play();
                    }
                };
            }
        }

        // タイマーラベル
        this.timerLabel = tm.app.Label("").addChildTo(this);
        this.timerLabel
            .setPosition(600, 160)
            .setFillStyle("#444")
            .setAlign("right")
            .setBaseline("bottom")
            .setFontFamily(FONT_FAMILY_FLAT)
            .setFontSize(128);

        // タイトルボタン
        var titleBtn = tm.app.FlatButton({
            width: 260,
            height: 100,
            text: "TITLE",
            bgColor: "#888",
        }).addChildTo(this);
        titleBtn.position.set(SCREEN_CENTER_X-150, 880);
        titleBtn.onpointingend = function() {
            self.nextLabel = "title";
            self.app.popScene();
        };
        // リスタートボタン
        var restartBtn = tm.app.FlatButton({
            width: 260,
            height: 100,
            text: "RESTART",
            bgColor: "#888",
        }).addChildTo(this);
        restartBtn.position.set(SCREEN_CENTER_X+150, 880);
        restartBtn.onpointingend = function() {
            self.app.replaceScene(GameScene());
        };
    },

    onenter: function(e) {
        e.app.pushScene(CountdownScene());
        this.onenter = null;
    },

    update: function(app) {
        // タイマー更新
        var time = ((app.frame/app.fps)*1000)|0;
        var timeStr = time + "";
        this.timerLabel.text = timeStr.replace(/(\d)(?=(\d\d\d)+$)/g, "$1.");
    }
});


/*
 * ピースクラス
 */
tm.define("Piece", {
    superClass: "tm.app.Shape",

    init: function(number) {
        this.superInit({
            width: PIECE_WIDTH,
            height: PIECE_HEIGHT
        });
        // 数値をセット
        this.number = number;

        this.setInteractive(true);
        this.setBoundingType("rect");

        var angle = tm.util.Random.randint(0, 360);
        this.canvas.clearColor("hsl({0}, 80%, 70%)".format(angle));

        this.label = tm.app.Label(number).addChildTo(this);
        this.label
            .setFontSize(70)
            .setFontFamily(FONT_FAMILY_FLAT)
            .setAlign("center")
            .setBaseline("middle");
        },

    disable: function() {
        this.setInteractive(false);

        var self = this;
        this.tweener
            .clear()
            .to({scaleX:0}, 100)
            .call(function() {
                self.canvas.clearColor("rgb(100, 100, 100)");
            }.bind(this))
            .to({scaleX:1, alpha:0.5}, 100)
    }
});

tm.define("CountdownScene", {
    superClass: "tm.app.Scene",

    init: function() {
        this.superInit();
        var self = this;

        var filter = tm.app.Shape({
            width: SCREEN_WIDTH,
            height: SCREEN_HEIGHT,
            bgColor: "rgba(250, 250, 250, 1.0)",
        }).addChildTo(this);
        filter.origin.set(0, 0);

        var label = tm.app.Label(3).addChildTo(this);
        label
            .setPosition(SCREEN_CENTER_X, SCREEN_CENTER_Y)
            .setFillStyle("#888")
            .setFontFamily(FONT_FAMILY_FLAT)
            .setFontSize(512)
            .setAlign("center")
            .setBaseline("middle");

        label.tweener
            .set({
                scaleX: 0.5,
                scaleY: 0.5,
                text: 3
            })
            .scale(1)
            .set({
                scaleX: 0.5,
                scaleY: 0.5,
                text: 2
            })
            .scale(1)
            .set({
                scaleX: 0.5,
                scaleY: 0.5,
                text: 1
            })
            .scale(1)
            .call(function() {
                self.app.frame = 0;
                self.app.popScene();
            });
    },
});
