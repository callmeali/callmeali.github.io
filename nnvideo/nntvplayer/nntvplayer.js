/*
	v1.0
	author by ljb
	2018.8.6
	require jQuery
*/

(function($){
	
	var videoapi = 'http://user.nntv.cn/nnplatform/index.php?mod=api&ac=tidecms&m=getvideourl&return=jsonback&inajax=1&globalid={0}&jsoncallback=?';
	var def = {
			autoplay: true
			,preload: true
			,loop: false
			,width: 640
			,height: 480
			,techOrder : ["html5"]
			,type: 1
	};
	function NntvPlayer(){
		this.elementid = null;
		this.container = null;
		this.options = {};
		this.userset = {};
		this.vjs = null;
	}
	NntvPlayer.domid = 'player';
	NntvPlayer.prototype = {
			init: function(opts){
				//初始化容器
				var el;
				var domid = opts.container;
				if(domid == null || domid == undefined){
					domid = NntvPlayer.domid;
					document.write('<div id="'+domid+'"></div>');
				}
				el = $('#'+domid);
				this.container = el;
				this.userset = opts;
				this.setOptions()
				if(el.length>0){
					this.buildHtml();
				}
			}
			//初始化参数
			,setOptions: function(){
				var _self = this;
				_self.options = $.extend({},def,_self.userset);
				if(_self.options.videoid != undefined && _self.options.source == undefined){
					_self.videoSource(function(){
						_self.videojs();
					});
				}
			}
			//构建video标签
			,buildHtml: function(){
				this.elementid = Math.round(Math.random()*100000);
				var tag = '<video id="vjs_'+this.elementid+'" class="video-js vjs-default-skin" controls>';
				this.container.append(tag);
				//屏蔽右键菜单
				this.container.find('video').bind('contextmenu',function(){return false;});
				this.videojs();
			}
			//渲染videojs组件
			,videojs: function(){
				var _self = this;
				if(_self.options.source != undefined){
					var setting = {};
					var typeMap = {
							mp4: 'video/mp4'
							,m3u8: 'application/x-mpegURL'
					};
					var s = _self.options.source;
					var ext = s.substring(s.lastIndexOf('.')+1);
					setting.sources = [{src:_self.options.source,type:typeMap[ext]}];
					delete _self.options.source;
					var opt = $.extend({},_self.options, setting);
					_self.vjs = videojs('vjs_'+_self.elementid,opt);
					_self.customVjs();
				}
			}
			//自定义videojs组件
			,customVjs: function(){
				var vjs = this.vjs;
				var Component = videojs.getComponent('Component');
				var Logo = videojs.extend(Component,{
					el:function(){
						//var img = videojs.dom.createEl('img',{},{src:'res/img/logo.png'});
						var container = videojs.dom.createEl('div',{className:'vjs-logo'});
						//container.appendChild(img);
						return container;
					}
				});
				videojs.registerComponent('logo', Logo);
				Logo.prototype.createEl('span');
				var myLogo = new Logo(vjs);

				var el = vjs.controlBar.addChild(myLogo);
				var bigPlay = vjs.getChild('BigPlayButton');
				vjs.removeChild(bigPlay);
				var bigPlayContainer = new Component(vjs);
				bigPlayContainer.addChild(bigPlay);
				bigPlayContainer.addClass('vjs-bigplay-container');
				vjs.addChild(bigPlayContainer);
			}
			//根据视频id获取地址
			,videoSource: function(handler){
				var _self = this;
				var api = videoapi.replace('{0}', _self.options.videoid);
				$.getJSON(api,function(data){
					if(data.error == 0){
						var vUrl = data.url.replace(/vodcdn.nntv.cn/,"mvod.nntv.cn");
						//var vUrl = data.url;
						_self.options.source = vUrl;
						vType = vUrl.slice(vUrl.lastIndexOf("."));
						handler();
					}else{
						console.log('error:'+data.message+' '+api);
					}
				 });
			}
	};
	$.extend({
		nntvplayer: function(opts){
			var nntvPlayer = new NntvPlayer();
			nntvPlayer.init(opts);
		}
	});
	$.fn.extend({
		nntvplayer: function(opts){
			if($(this).length == 0){
				return;
			}
			opts.container = $(this).attr('id');
			$.nntvplayer(opts);
		}
	});
	$(document).ready(function(){
		var playerClass = 'nntvplayer';
		var i = 1;
		$('.'+playerClass).each(function(){
			_self = $(this);
			var id = 'nntvplayer'+i;
			_self.append('<div id="'+id+'"></div>');
			var opts = {};
			var setting = _self.attr('data-option');
			if(setting != null && setting != undefined){
				var opts = eval('({'+setting+'})');
			}
			$('#'+id).nntvplayer(opts);
			i++;
		});
	});
	//获取js文件路径
	(function(){
		var scriptPath = function () {
		    var js = document.scripts || document.getElementsByTagName("script");
		    var jsPath;
		    for (var i = js.length; i > 0; i--) {
		        if (js[i - 1].src.indexOf("nntvplayer") > -1) {
		            jsPath = js[i - 1].src.substring(0, js[i - 1].src.lastIndexOf("/") + 1);
		            break;
		        }
		    }
		    return jsPath;
		}
		var linkStyle = function(url){
			var link = document.createElement("link");
			link.rel = "stylesheet";
			link.type = "text/css";
			link.href = url;
			document.getElementsByTagName("head")[0].appendChild(link);
		}
		//引用videojs库
		var path = scriptPath();
		document.write(unescape("%3Cscript src='" + path + "video.min.js' type='text/javascript'%3E%3C/script%3E"));
		document.write(unescape("%3Cscript src='" + path + "lang/zh-CN.js' type='text/javascript'%3E%3C/script%3E"));
		linkStyle(path + 'video-js.min.css');
		linkStyle(path + 'nntvplayer.css');
	})();
})(window.jQuery)