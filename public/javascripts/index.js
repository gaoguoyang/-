function $(s){
	return document.querySelectorAll(s);
}

var lis = $("#lis li");

var size = 32;

var box = $("#box")[0];
var height,width;
var canvas = document.createElement("canvas");//创建canvas对象
var ctx = canvas.getContext("2d");//获取canvas的Context对象
box.appendChild(canvas);

var Dots = [];
var line;
var types = $("#type li");
var mv = new MusicVisualizer({
	size: size,
	visualizer: draw
})

for(var i=0; i<lis.length; i++){
	lis[i].onclick = function(){
		for(var j=0; j<lis.length; j++){
			lis[j].className = "";
		}
		this.className = "selected";
		// load("/media/"+this.title);
		mv.play("/media/"+this.title);
	}
}
function random(m,n){
	return Math.round(Math.random()*(n -m) + m);
}
function getDots(){
	Dots = [];
	for(var i = 0; i < size; i++){
		var x = random(0, width);
		var y = random(0, height);//点的位置
		var color = "rgba("+random(0, 255)+","+random(0, 255)+","+random(0, 255)+",0)";//点的颜色
		Dots.push({
			x: x,
			y: y,
			dx: random(1,4),
			color: color,
			cap: 0
		})
	}
}

function resize(){
	height = box.clientHeight;
	width = box.clientWidth;//获取box宽高
	canvas.height = height;
	canvas.width = width;//给canvas设宽高
	line = ctx.createLinearGradient(0, 0, 0, height);//创建线性渐变
	line.addColorStop(0, "red");
	line.addColorStop(0.5, "yellow");
	line.addColorStop(1, "green");//添加渐变色
	getDots();
}
resize();

window.onresize = resize;//当窗口改变的时候重新计算

function draw(arr){//实现可视化
	ctx.clearRect(0, 0, width, height);
	var w = width /size;//柱状图的宽度
	var cw = w * 0.6;
	var capH = cw > 10 ? 10 : cw;
	ctx.fillStyle = line;
	for(var i=0; i<size; i++){
		var o = Dots[i];
		if(draw.type == "column"){
			var h = arr[i]/256*height;//柱状图的高度
			ctx.fillRect(w*i, height - h, cw, h);//绘制柱状图
			ctx.fillRect(w*i, height - (o.cap+capH), cw, capH);
			o.cap--;
			if(o.cap < 0){
				o.cap = 0;
			}
			if(h > 0 && o.cap < h + 40){
				o.cap = h + 40 > height - capH ? height - capH : h + 40;
			}
		}else if(draw.type == "dot"){
			ctx.beginPath();
			
			var r = 10 + arr[i]/255*(height > width ? width : height)/10;//圆的半径
			ctx.arc(o.x, o.y, r, 0, Math.PI*2, true);//绘制圆
			var g = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, r);//创建圆形渐变
			g.addColorStop(0, "#fff");
			g.addColorStop(1, o.color);
			ctx.fillStyle = g;//填充渐变颜色
			ctx.fill();
			o.x += o.dx;
			o.x = o.x > width ? 0 : o.x;
			// ctx.strokeStyle = "#fff";
			// ctx.stroke();
		}
	}
}

draw.type = "column";

for(var i=0; i<types.length; i++){
	types[i].onclick = function(){
		for(var j = 0; j<types.length; j++){
			types[j].className = "";
		}
		this.className = "selected";
		draw.type = this.getAttribute("data-type");
	}
}




$("#volume")[0].onchange = function(){
	mv.changeVolume(this.value/this.max);
}
$("#volume")[0].onchange();