function MusicVisualizer(obj){
	this.source = null;

	this.count = 0;

	this.analyser = MusicVisualizer.ac.createAnalyser();//创建AnalyserNode对象
	this.size = obj.size;
	this.analyser.fftSize = this.size * 2;//设置AnalyserNode对象的fftSize属性的大小
	this.gainNode = MusicVisualizer.ac[MusicVisualizer.ac.createGain ? "createGain" : "createGainNode"]();//创建GainNode对象
	this.gainNode.connect(MusicVisualizer.ac.destination);
	//将GainNode对象连接到AudioDestinationNode对象上

	this.analyser.connect(this.gainNode);//将分析对象连接到gainNode对象上

	this.xhr = new XMLHttpRequest();//创建Ajax对象

	this.visualizer = obj.visualizer;
	this.visualize();
}

MusicVisualizer.ac = new (window.AudioContext||window.webkitAudioContext)();//创建AudioContent

MusicVisualizer.prototype.load = function(url,fun){
	this.xhr.abort();
	this.xhr.open("GET",url);//确定即将连接的网址及方式
	this.xhr.responseType = "arraybuffer";//设置请求返回的结果类型
	var self = this;
	this.xhr.onload = function(){
		fun(self.xhr.response);
	}
	this.xhr.send();//发送给服务器
}

MusicVisualizer.prototype.decode = function(arraybuffer,fun){
	MusicVisualizer.ac.decodeAudioData(arraybuffer,function(buffer){
		fun(buffer);//回调函数
	},function(err){
		console.log(err);
	})
}//解码得到AudioBuffer类型的数据

MusicVisualizer.prototype.play = function(url){
	var n = ++this.count;
	var self = this;
	this.source && this.stop();
	this.load(url, function(arraybuffer){
		if(n != self.count)return;
		self.decode(arraybuffer, function(buffer){
			if(n != self.count)return; 
			var bs = MusicVisualizer.ac.createBufferSource();
			//创建AudioBufferSourceNode音频资源对象，该对象的音频资源数据存储在它的buffer属性里
			bs.connect(self.analyser);
			//将创建的bs对象连接到analyser对象上，从而连接到destination对象上
			bs.buffer = buffer;
			//AudioBufferSourceNode音频资源对象的buffer属性接收AudioBuffer类型的数据
			bs[bs.start ? "start" : "noteOn"](0);
			self.source = bs;
		})
	})
}

MusicVisualizer.prototype.stop = function(){
	this.source[this.source.stop ? "stop" : "noteOff"](0);
}
MusicVisualizer.prototype.changeVolume = function(percent){
	this.gainNode.gain.value = percent * percent;//调节音量大小
}

MusicVisualizer.prototype.visualize = function(){//得到analyser分析得到的数据
	var arr = new Uint8Array(this.analyser.frequencyBinCount);//定义数组；frequencyBinCount为fftSize的一半
	this.analyser.getByteFrequencyData(arr);//将分析的数据复制到数组里
	requestAnimationFrame = window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame;//动画函数；时时分析，持续得到数据
	var self = this;
	function v(){
		self.analyser.getByteFrequencyData(arr);
		self.visualizer(arr);
		requestAnimationFrame(v);
	}

	requestAnimationFrame(v);
}