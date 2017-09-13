function GetRequest() {
	var url = location.search; //获取url中"?"符后的字串 
	var theRequest = new Object();
	if(url.indexOf("?") != -1) {
		var str = url.substr(1);
		strs = str.split("&");
		for(var i = 0; i < strs.length; i++) {
			theRequest[strs[i].split("=")[0]] = unescape(strs[i].split("=")[1]);
		}
	}
	return theRequest;
}
mui.ready(function() {
	var page = 1;
	var $_GET = GetRequest();
	
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
					var param = $_GET;
					param.page = page;
					
					mui.getJSON('data/detail.json',param,function(data){
						if(data.code == 0){
							mui.alert('请求出错，请刷新重试');
							return false;
						}
						var html = template('tpl-list', data.data);
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
	
	mui.getJSON('data/detail.json',$_GET,function(data){
		if(data.code == 0){
			mui.alert('您访问的内容不存在',function(){
				history.back();
			});
			return false;
		}
		var html = template('tpl-detail', data.data.detail);
		h('#content-detail').html(html);
		
		//资讯存在评论时，渲染评论区视图
		if(h('#comments-box').length > 0){
			var comments = template('tpl-comments',data.data);
			h('#comments-box').html(comments);
			if($_GET.type=='live'){
				//页面顶部分类导航
				var deceleration = mui.os.ios ? 0.003 : 0.0009;
				mui('.mui-scroll-wrapper').scroll({
					bounce: false,
					indicators: true, //是否显示滚动条
					deceleration: deceleration
				});
				
		//		mui(".mui-slider").slider({ interval: 2000 });
				page++;
				//绑定下拉加载事件
				pulluprefresh();
			}
		}
	});
	
	//查看更多评论按钮事件
	mui('body').on('tap','.showmore',function(){
		mui.getJSON('data/detail.json',$_GET,function(data){
			if(data.code == 0){
				mui.alert('请求出错，请刷新重试');
				return false;
			}
			var html = template('tpl-cmtlayer', data.data);
			h('#comments-layer').html(html);
			
			//页面顶部分类导航
			var deceleration = mui.os.ios ? 0.003 : 0.0009;
			mui('.mui-scroll-wrapper').scroll({
				bounce: false,
				indicators: true, //是否显示滚动条
				deceleration: deceleration
			});
			
	//		mui(".mui-slider").slider({ interval: 2000 });
			page++;
			h('body').css({'position':'fixed'});//消除页面太长时，弹层跟着滚动问题
			h('#comments-layer').show();
			//绑定下拉加载事件
			pulluprefresh();
		});
	});
	
	//关闭弹层事件
	mui('body').on('tap','.closelayer',function(){
		page = 1;
		h('body').css({'position':'static'});
		h('.poplayer').hide();
	});
	
	//点击参与活动按钮
	mui('body').on('tap','.btn-status',function(){
		var status = this.getAttribute('data-status');
		if(status != 1){
			mui.alert(h(this).html());
			return false;
		}
		
		h('body').css({'position':'fixed'});
		h('#act-layer').show();
	});
});