mui.ready(function() {
	var hash = 'news'; //页面hash值
	var isindex = true; //资讯首页判断  列表页没有轮播图
	var page = 1;
	var catalogid = 0;// 顶部导航id
	if(location.hash) {
		hash = location.hash.substr(1);
	}
	
	//点击主导航操作，初始化页面参数
	mui('#main-nav').on('tap', '.mui-tab-item', function() {
		location.href = this.getAttribute('href');
		hash = location.hash.substr(1);
		isindex = true;
		page = 1;
		catalogid = 0;
		
		h('#main-nav .mui-tab-item').removeClass('mui-active');
		h('.icon-' + hash).parent().addClass('mui-active');
		document.title = h('#main-nav .mui-active .mui-tab-label').html();
		
		renderTpl(hash);
	});
	
	mui('body').on('tap','#header-nav .mui-control-item',function(){
		page = 1;
		catalogid = parseInt(this.getAttribute('data-id'));
		if(catalogid > 0){
			isindex = false;
			renderTpl(hash,{catalogid:catalogid});
		}else{
			isindex = true;
			renderTpl(hash);
		}
	});
	
	
	//页面渲染方法
	var renderTpl = function(hash,param){
		param = param?param:{};
		param.hash = hash;
		mui.getJSON('data/news.json',param,function(data){
			data.isindex = isindex;
			data.catalogid = catalogid;
			var html = template('tpl-' + hash, data);
			h('#content').html(html);
	
			//页面顶部分类导航
			var deceleration = mui.os.ios ? 0.003 : 0.0009;
			mui('.mui-scroll-wrapper').scroll({
				bounce: false,
				indicators: true, //是否显示滚动条
				deceleration: deceleration
			});
			
			mui(".mui-slider").slider({ interval: 2000 });
			page++;
			pulluprefresh();
		});
	};
	
	var appendHTML = function(html) {
	    var divTemp = document.createElement("div"), nodes = null
	        // 文档片段，一次性append，提高性能
	        , fragment = document.createDocumentFragment();
	    divTemp.innerHTML = html;
	    nodes = divTemp.childNodes;
	    for (var i=0, length=nodes.length; i<length; i++) {
	       fragment.appendChild(nodes[i].cloneNode(true));
	    }
	    
	    nodes = null;
	    return fragment;
//	    fragment = null;
	};
	
	// 上拉加载
	var canpull = true;
	var pulluprefresh = function(){
		mui('body .mui-scroll-updown').pullToRefresh({
			up: {
				callback: function() {
					if(!canpull){
						return false;
					}
					var self = this;
					var param = {hash:hash,page:page};
					
					mui.getJSON('data/news.json',param,function(data){
						var html = template('tpl-' + hash + '-list', data);
						html = appendHTML(html);
						var ul = self.element.querySelector('.mui-table-view');
						ul.appendChild(html);
						self.endPullUpToRefresh(true);
						canpull = true;
					});
				}
			}
		});
	};
	
	
	if(h('.icon-' + hash).length > 0){
		//初始化活动状态的底部导航
		h('.icon-' + hash).parent().addClass('mui-active');
		document.title = h('.mui-bar-tab .mui-active .mui-tab-label').html();
		//页面加载初始化渲染操作
		renderTpl(hash);
	}else{
		mui.alert('错误的请求');
	}
	
	
	//我的评论收藏订阅
	var canpullmy = true;
	var pagemy = 1;
	var pulluprefreshmy = function(){
		mui('body .mui-scroll-updownmy').pullToRefresh({
			up: {
				callback: function() {
					if(!canpullmy){
						return false;
					}
					var self = this;
					var param = {type:mytype};
					param.page = pagemy;
					
					mui.getJSON('data/detail.json',param,function(data){
						if(data.code == 0){
							mui.alert('请求出错，请刷新重试');
							return false;
						}
						data.data.type = mytype;
						var html = template('tpl-list', data.data);
						html = appendHTML(html);
						var ul = self.element.querySelector('.mui-table-view');
						ul.appendChild(html);
						self.endPullUpToRefresh(true);
						canpullmy = true;
					});
				}
			}
		});
	};
	var mytype;
	mui(document.body).on('tap','.showmy',function(){
		mytype = h(this).attr('data-type');
		mui.getJSON('data/detail.json',{type:mytype},function(data){
			if(data.code == 0){
				mui.alert('请求出错，请刷新重试');
				return false;
			}
			data.data.type = mytype;
			var html = template('tpl-mylayer', data.data);
			h('#comments-layer').html(html);
			
			//页面顶部分类导航
			var deceleration = mui.os.ios ? 0.003 : 0.0009;
			mui('.mui-scroll-wrapper').scroll({
				bounce: false,
				indicators: true, //是否显示滚动条
				deceleration: deceleration
			});
			
	//		mui(".mui-slider").slider({ interval: 2000 });
			pagemy++;
			h('body').css({'position':'fixed'});//消除页面太长时，弹层跟着滚动问题
			h('#comments-layer').show();
			//绑定下拉加载事件
			pulluprefreshmy();
		});
	});
	//关闭弹层事件
	mui('body').on('tap','.closelayer',function(){
		pagemy = 1;
		h('body').css({'position':'static'});
		h('.poplayer').hide();
	});
});