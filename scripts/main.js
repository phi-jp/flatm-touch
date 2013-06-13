/*
 * main.js
 */

/*
 * contant
 */
var SCREEN_WIDTH    = 680;
var SCREEN_HEIGHT   = 960;
var SCREEN_CENTER_X = SCREEN_WIDTH/2;
var SCREEN_CENTER_Y = SCREEN_HEIGHT/2;

var PIECE_NUM_X     = 5;
var PIECE_NUM_Y     = 5;
var PIECE_OFFSET_X  = 90;
var PIECE_OFFSET_Y  = 240;
var PIECE_WIDTH     = 120;
var PIECE_HEIGHT    = 120;


/*
 * main
 */
tm.main(function() {
    var app = tm.app.CanvasApp("#world");
    app.resize(SCREEN_WIDTH, SCREEN_HEIGHT);
    app.fitWindow();
    app.background = "rgba(250, 250, 250, 1.0)";

    app.replaceScene( GameScene() );

    app.run();
});


tm.define("GameScene", {
    superClass: "tm.app.Scene",

    init: function() {
        this.superInit();

        var self = this;

        self.currentNumber = 1;

        this.pieceGroup = tm.app.CanvasElement();
        this.addChild(this.pieceGroup);

        // 数字配列
        var nums = [].range(1, 26);  // 1~25
        nums.shuffle(); // シャッフル

        // ピースを作成
        for (var i=0; i<PIECE_NUM_Y; ++i) {
            for (var j=0; j<PIECE_NUM_X; ++j) {
                // 数値
                var number = nums[ i*PIECE_NUM_X+j ];
                // ピースを生成してピースグループに追加
                var piece = Piece(number).addChildTo(this.pieceGroup);
                // 座標を設定
                piece.x = j * 125 + PIECE_OFFSET_X;
                piece.y = i * 125 + PIECE_OFFSET_Y;
                // タッチ時のイベントリスナーを登録
                piece.onpointingstart = function() {
                    if (this.number === self.currentNumber) {
                        self.currentNumber += 1;
                        this.disable();
                    }
                    else {

                    }
                };
            }
        }

        // タイマーラベル
        this.timerLabel = tm.app.Label("99.999").addChildTo(this);
        this.timerLabel
            .setPosition(650, 160)
            .setFillStyle("#444")
            .setAlign("right")
            .setBaseline("bottom")
            .setFontFamily("'ヒラギノ角ゴ Pro W3' 'Hiragino Kaku Gothic Pro' 'メイリオ' 'Meiryo' 'ＭＳ Ｐゴシック' 'MS PGothic' sans-serif")
            .setFontSize(128);

        // タイトルボタン
        var titleBtn = tm.app.FlatButton({
            width: 300,
            height: 100,
            text: "TITLE",
        }).addChildTo(this);
        titleBtn.position.set(180, 880);
        titleBtn.onpointingend = function() {

        };
        // リスタートボタン
        var restartBtn = tm.app.FlatButton({
            width: 300,
            height: 100,
            text: "RESTART",
        }).addChildTo(this);
        restartBtn.position.set(500, 880);
        restartBtn.onpointingend = function() {

        };
    },

    update: function(app) {
        // タイマー更新
        var time = ((app.frame/app.fps)*1000)|0;
        var timeStr = time + "";
        this.timerLabel.text = timeStr.replace(/(\d)(?=(\d\d\d)+$)/g, "$1,");
    }
});


/*
 * ピースクラス
 */
tm.define("Piece", {
    superClass: "tm.app.Shape",

    init: function(number) {
        this.superInit(PIECE_WIDTH, PIECE_HEIGHT);
        // 数値をセット
        this.number = number;

        this.setInteractive(true);
        this.setBoundingType("rect");

        var angle = tm.util.Random.randint(0, 360);
        this.canvas.clearColor("hsl({0}, 80%, 70%)".format(angle));

        this.label = tm.app.Label(number).addChildTo(this);
        this.label
            .setFontSize(60)
            .setFontFamily("'ヒラギノ角ゴ Pro W3' 'Hiragino Kaku Gothic Pro' 'メイリオ' 'Meiryo' 'ＭＳ Ｐゴシック' 'MS PGothic' sans-serif")
            .setFontWeight("bold")
            .setAlign("center")
            .setBaseline("middle");
    },

    disable: function() {
        this.setInteractive(false);

        // this.parent.addChild(this);
        // this.tweener
        //     .to({
        //         scaleX: 2.0,
        //         scaleY: 2.0,
        //         alpha: 0.0,
        //     });
        this.alpha = 0.5;
        this.canvas.clearColor("rgb(100, 100, 100)");
    }
});


