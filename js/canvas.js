//マウスボタンを確認
var drawFlag = false;
//今の座標を記録
var x = 0;
var y = 0;
//古い座標を記録
var oldX = 0;
var oldY = 0;
var canvasArea;
var canvasView;
var can;
var context;

// undo , redo スタック用配列
let undoDataStack = [];
let redoDataStack = [];
const STACK_MAX_SIZE = 5;

var fillDots = [[-1, 0], [1, 0],[0,-1]];

function testbtn(){
	var a = [];
	a.push([0,1]);
	a.push([2,3]);
	a.push([4,5]);
	a.push([6,7]);
	a.shift();
	console.log(a);
}

// 画面サイズ変更時
function changeCanvasSize() {
	$("#canvas-area").attr("style", "width:" + $("#canvas-width").val() + "px;height:" + $("#canvas-height").val() + "px;");
	$("#canvas-area canvas").attr("width", $("#canvas-width").val());
	$("#canvas-area canvas").attr("height", $("#canvas-height").val());
}

// 描画ツール変更時処理
function changeDrawTool() {
	if($("input[name=drawtool]:checked").val() === "1"){
		context.globalCompositeOperation = 'destination-out';
	}else{
		context.globalCompositeOperation = 'source-over';
	}
}

//初期化
function init(){
	can = document.getElementById("main-canvas");
	canvasArea = document.getElementById("canvas-area");
	canvasView = document.getElementById("canvas-view");
	context = can.getContext("2d");
	$("input[name=drawtool]:eq(0)").prop("checked", true);
	changeCanvasSize();
	$("#drawtool-figure-list").hide();
}


window.addEventListener("load", function(){
	//初期化
	init();

	// マウスホイールでペンの太さ変更
	canvasArea.addEventListener("wheel", function(e) {
    	if(e.deltaY > 0){
        	$("#lineWidth").val($("#lineWidth").val() - 1);
    	}else if(e.deltaY < 0){
        	$("#lineWidth").val($("#lineWidth").val() - ( - 1));
    	}
    	clear(canvasView);
		drawPointer();
    }, false);

	//イベントハンドラ
	//マウスイベント
	window.addEventListener("mousemove", function(e) {
		var rect = canvasArea.getBoundingClientRect();
		x = e.clientX - Math.round(rect.left);
		y = e.clientY - Math.round(rect.top);

		clear(canvasView);
		if($("input[name=drawtool]:checked").val() === "0" || $("input[name=drawtool]:checked").val() === "1"){
			// 鉛筆・消しゴム
			draw(can);
			oldX = x;
			oldY = y;
		}else if($("input[name=drawtool]:checked").val() === "4"){
			// バケツ
			//drawFill(canvasView);
		}else if($("input[name=drawtool]:checked").val() === "6"){
			// 画像
			drawImage(canvasView);
		}else if($("input[name=drawtool]:checked").val() === "11"){
			// 線
			drawLine(canvasView);
		}else if($("input[name=drawtool]:checked").val() === "12"){
			// 四角
			drawRect(canvasView);
		}else if($("input[name=drawtool]:checked").val() === "13"){
			// 円
			drawCircle(canvasView);
		}else if($("input[name=drawtool]:checked").val() === "14"){
			// 矢印
			drawFigure(canvasView, "ArrowVertical");
		}
		drawPointer();
	}, false);
	canvasArea.addEventListener("mousedown", function(e) {
		var rect = canvasArea.getBoundingClientRect();
		x = e.clientX - Math.round(rect.left);
		y = e.clientY - Math.round(rect.top);

		//座標表示
		document.getElementById("x_mouse").innerHTML = x;
		document.getElementById("y_mouse").innerHTML = y;

		// 左クリックの場合描画開始
		if(e.button == 0){
			drawFlag = true;
			beforeDraw();
		}

		if($("input[name=drawtool]:checked").val() === "0" || $("input[name=drawtool]:checked").val() === "1"){
			draw(can);
		}
		oldX = x;
		oldY = y;
	}, false);
	window.addEventListener("mouseup", function(e) {
		if($("input[name=drawtool]:checked").val() === "0" || $("input[name=drawtool]:checked").val() === "1"){
			draw(can);
		}else if($("input[name=drawtool]:checked").val() === "11"){
			drawLine(can);
		}else if($("input[name=drawtool]:checked").val() === "12"){
			drawRect(can);
		}else if($("input[name=drawtool]:checked").val() === "13"){
			drawCircle(can);
		}else if($("input[name=drawtool]:checked").val() === "14"){
			drawFigure(can, "ArrowVertical");
		}else if($("input[name=drawtool]:checked").val() === "6"){
			drawImage(can);
		}
		drawFlag = false;
	}, false);

	canvasArea.addEventListener("click", function(e) {
		if($("input[name=drawtool]:checked").val() === "4"){
			drawFill(can);
		}
	}, false);

	// マウスをクリックしてない時
//	can.addEventListener('mouseleave', function(e) {
//		drawFlag = false;
//	}, false);

	document.getElementById("drawtool-figure").addEventListener("click", function(e) {
		if($("#drawtool-figure").prop("checked")){
			$("#drawtool-figure-list").show();
		}else{
			$("#drawtool-figure-list").hide();
		}
	}, false);

}, true);

//描画処理(鉛筆 or 消しゴム)
function draw(canvas) {
	//座標表示
	document.getElementById("x_mouse").innerHTML = x;
	document.getElementById("y_mouse").innerHTML = y;

	//マウスボタン
	if (!drawFlag) return;

	// コンテキスト取得
	var ctx = canvas.getContext("2d");

	//描画
	ctx.lineCap = 'round';
	ctx.strokeStyle = $('#color-dialog').val();
	ctx.lineWidth = $("#lineWidth").val();
	ctx.beginPath();
	ctx.moveTo(oldX, oldY);
	ctx.lineTo(x, y);
	ctx.stroke();
	ctx.closePath();
}

//描画処理(線)
function drawLine(canvas) {
	//座標表示
	document.getElementById("x_mouse").innerHTML = x;
	document.getElementById("y_mouse").innerHTML = y;

	//マウスボタン
	if (!drawFlag) return;

	// コンテキスト取得
	var ctx = canvas.getContext("2d");

	//描画
	ctx.lineCap = 'round';
	ctx.strokeStyle = $('#color-dialog').val();
	ctx.lineWidth = $("#lineWidth").val();
	ctx.beginPath();
	ctx.moveTo(oldX, oldY);
	ctx.lineTo(x, y);
	ctx.stroke();
	ctx.closePath();
}

//描画処理(四角)
function drawRect(canvas) {
	//座標表示
	document.getElementById("x_mouse").innerHTML = x;
	document.getElementById("y_mouse").innerHTML = y;

	//マウスボタン
	if (!drawFlag) return;

	// コンテキスト取得
	var ctx = canvas.getContext("2d");

	//描画
	ctx.strokeStyle = $('#color-dialog').val();
	ctx.lineWidth = $("#lineWidth").val();
	ctx.beginPath();
	ctx.strokeRect(oldX, oldY, x-oldX, y-oldY);
	ctx.stroke();
	ctx.closePath();
}

//描画処理(丸)
function drawCircle(canvas) {
	//座標表示
	document.getElementById("x_mouse").innerHTML = x;
	document.getElementById("y_mouse").innerHTML = y;

	//マウスボタン
	if (!drawFlag) return;

	// コンテキスト取得
	var ctx = canvas.getContext("2d");

	//描画
	ctx.strokeStyle = $('#color-dialog').val();
	ctx.lineWidth = $("#lineWidth").val();
	var minX = x;
	var minY = y;
	var rx = (oldX-x)/2;
	if(rx < 0){
		rx *= -1;	minX = oldX;
	}
	var ry = (oldY-y)/2;
	if(ry < 0){
		ry *= -1;	minY = oldY;
	}

	ctx.beginPath();
	if(ry > rx){
		ctx.setTransform(rx/ry,0,0,1,(minX + rx/2)*(1-rx/ry),0);
		ctx.arc(x+(oldX-x)/2, y+(oldY-y)/2, ry , 0, Math.PI*2, false);
	}else if(rx > ry){
		ctx.setTransform(1,0,0,ry/rx,0,(minY + ry/2)*(1-ry/rx));
		ctx.arc(x+(oldX-x)/2, y+(oldY-y)/2, rx , 0, Math.PI*2, false);
	}else{
		ctx.arc(x+(oldX-x)/2, y+(oldY-y)/2, rx , 0, Math.PI*2, false);
	}
	ctx.setTransform(1,0,0,1,0,0);
	ctx.stroke();
	ctx.closePath();
}

//描画処理(バケツ)
function drawFill(canvas) {
	var p = 1;

	fillDots = [[-p, 0], [p, 0],[0,-p],[0,p]];
	//マウスボタン
	//if (!drawFlag) return;

	//alert($(canvas).attr("id"));

	// コンテキスト取得
	var ctx = canvas.getContext("2d");

	// 選択色
	var color = $('#color-dialog').val();
	// 塗りつぶされる色
	var fillColor = getColor(ctx, x, y);

	ctx.strokeStyle = $('#color-dialog').val();
	ctx.lineWidth = 1;

	// 座標バッファ
	var buffer = [[x,y]];

	ctx.beginPath();
	ctx.strokeRect(x+0.5, y+0.5, 0.0001, 0.0001);

	ctx.stroke();
	ctx.closePath();

	ctx.beginPath();
	ctx.strokeStyle = color;

	while(buffer.length != 0){
		//alert(buffer[0]);
		var bx = buffer[0][0];
		var by = buffer[0][1];
		var canvasWidth = $("#canvas-width").val();
		var canvasHeight = $("#canvas-height").val();
		for(var i = 0; i < fillDots.length; i++){
			//alert(getColor(ctx, bx + fillDots[i][0], by + fillDots[i][1]) + " : " + fillColor);
			if(compareColor(getColor(ctx, bx + fillDots[i][0], by + fillDots[i][1]), fillColor) < 200){
				if(bx + fillDots[i][0] >= 0 && bx + fillDots[i][0] < canvasWidth
				&& by + fillDots[i][1] >= 0 && bx + fillDots[i][1] < canvasHeight){
					buffer.push([bx + fillDots[i][0],by + fillDots[i][1]]);
				}
				ctx.strokeRect(bx + fillDots[i][0]+0.5, by + fillDots[i][1]+0.5, 0.0001, 0.0001);
			}
		}
		buffer.shift();
	}
	ctx.stroke();
	ctx.closePath();

	//alert(cnt);
}
function aaa(){
	//alert();
}

//描画処理(画像)
function drawImage(canvas) {
	//座標表示
	document.getElementById("x_mouse").innerHTML = x;
	document.getElementById("y_mouse").innerHTML = y;

	//マウスボタン
	if (!drawFlag) return;

	// コンテキスト取得
	var ctx = canvas.getContext("2d");

	// HTMLImageElement オブジェクトを作成する
	var image = new Image();

	// URL を指定して、画像の読み込みを開始する
	image.src = "/img/canvas.png";

	ctx.strokeStyle = $('#color-dialog').val();
	ctx.lineWidth = 1;
	ctx.beginPath();

	ctx.drawImage(image, oldX, oldY, x - oldX , y - oldY);

	ctx.stroke();
	ctx.closePath();
}

function drawFigure(canvas, figure){
	//座標表示
	document.getElementById("x_mouse").innerHTML = x;
	document.getElementById("y_mouse").innerHTML = y;

	//マウスボタン
	if (!drawFlag) return;

	// コンテキスト取得
	var ctx = canvas.getContext("2d");

	ctx.strokeStyle = $('#color-dialog').val();
	ctx.lineWidth = $("#lineWidth").val();
	ctx.beginPath();
	eval("drawFigure" + figure + "(ctx)");
	ctx.stroke();
	ctx.closePath();

}

function drawFigureArrowVertical(ctx){
	ctx.lineCap = 'square';
	var width = x - oldX;
	var height = y - oldY;
	ctx.moveTo(oldX + width * 0.3, oldY + height * 0.5);
	ctx.lineTo(oldX + width * 0.3, oldY + height * 1.0);
	ctx.lineTo(oldX + width * 0.7, oldY + height * 1.0);
	ctx.lineTo(oldX + width * 0.7, oldY + height * 0.5);
	ctx.lineTo(oldX + width * 1.0, oldY + height * 0.5);
	ctx.lineTo(oldX + width * 0.5, oldY + height * 0.0);
	ctx.lineTo(oldX + width * 0.0, oldY + height * 0.5);
	ctx.lineTo(oldX + width * 0.3, oldY + height * 0.5);
}

// 色検出
function getColor(ctx, x, y) {
	return imagedata = context.getImageData(x,y,1,1).data;
}

// 色比較
function compareColor(color1, color2) {
	return Math.abs(color1[0]-color2[0])
		+	Math.abs(color1[1]-color2[1])
		+	Math.abs(color1[2]-color2[2])
		+	Math.abs(color1[3]-color2[3]);
}

// 画面クリア
function clear(canvas){
	canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
}

// ダウンロード
function download(){
	var link = document.createElement('a');
    link.innerHTML = 'download image';
    link.addEventListener('click', function() {
    	link.href = can.toDataURL();
    	link.download = "mypainting.png";
    }, false);
    $(link).hide();
    document.body.appendChild(link);
    link.click();
}

// カーソル周りに円表示(線の太さにあわせる)
function drawPointer(){
	ctxView = canvasView.getContext("2d");
	ctxView.lineWidth = 1;
	ctxView.strokeStyle = "#000000";
	ctxView.beginPath();
	var r = $("#lineWidth").val()/2;
	ctxView.arc(x, y, r, 0, Math.PI*2, true);
	ctxView.stroke();
	ctxView.closePath();
}

//canvasへの描画処理を行う前に行う処理
function beforeDraw() {
	var ctx = can.getContext("2d");
    // やり直し用スタックの中身を削除
    redoDataStack = [];
    // 元に戻す用の配列が最大保持数より大きくなっているかどうか
    if (undoDataStack.length >= STACK_MAX_SIZE) {
        // 条件に該当する場合末尾の要素を削除
        undoDataStack.pop();
    }
    // 元に戻す配列の先頭にcontextのImageDataを保持する
    undoDataStack.unshift(ctx.getImageData(0, 0, $(can).width(), $(can).height()));
}

function undo () {
	var ctx = can.getContext("2d");
	// 戻す配列にスタックしているデータがなければ処理を終了する
	if (undoDataStack.length <= 0) return;
	// やり直し用の配列に元に戻す操作をする前のCanvasの状態をスタックしておく
	redoDataStack.unshift(ctx.getImageData(0, 0, $(can).width(), $(can).height()));
	// 元に戻す配列の先頭からイメージデータを取得して
	var imageData = undoDataStack.shift();
	// 描画する
	ctx.putImageData(imageData, 0, 0);
}

function redo () {
	var ctx = can.getContext("2d");
	// やり直し用配列にスタックしているデータがなければ処理を終了する
	if (redoDataStack.length <= 0) return;
	// 元に戻す用の配列にやり直し操作をする前のCanvasの状態をスタックしておく
	undoDataStack.unshift(ctx.getImageData(0, 0, $(can).width(), $(can).height()));
	// やり直す配列の先頭からイメージデータを取得して
	var imageData = redoDataStack.shift();
	// 描画する
	ctx.putImageData(imageData, 0, 0);
}

function wait(sec) {

    // jQueryのDeferredを作成します。
    var objDef = new $.Deferred;

    setTimeout(function () {

        // sec秒後に、resolve()を実行して、Promiseを完了します。
        objDef.resolve(sec);

    }, sec*1000);

    return objDef.promise();

};
