function Slide(node, config){
	if (typeof $ === 'undefined') {
		throw new Error('需要引入jQuery文件');
	}
	var defaultPara = {
		dir: 'horizontal',  //滚动方向（水平或竖直）
		speed: 500,  //滚动速度
		perGroup: 1,  //显示数量
		perSlideView: 1,  //每次滚动的数量
		autoPlay: 0,  //自动滚动的时间间隔，大于0时有效
		loop: true,  //是否循环滚动
		pagination: null,  //分页器
		outerPagination: false,  //是否是外部的分页器
		pageClickable: true,  //分页器是否可点击
		fullPage: false,  //是否全屏滚动
		showPageNum: false,  //是否显示分页器数字
		fadeInAndOut: false  //是否渐显与渐隐轮播
	};
	$.extend(defaultPara, config);
	this.block = $(node),
	this.dir = defaultPara.dir,
	this.speed = defaultPara.speed,
	this.perGroup = defaultPara.perGroup,
	this.perSlideView = defaultPara.perSlideView,
	this.autoPlay = defaultPara.autoPlay,
	this.loop = defaultPara.loop,
	this.pagination = $(defaultPara.pagination),
	this.outerPagination = defaultPara.outerPagination,
	this.pageClickable = defaultPara.pageClickable,
	this.fullPage = defaultPara.fullPage,
	this.showPageNum = defaultPara.showPageNum,
	this.fadeInAndOut = defaultPara.fadeInAndOut;
	//考虑到animate()方法而不得不暴露的变量
	this.list = this.block.find('ul');
	var _li = this.list.find('li');
	this.liWidth = _li.width(),
	this.liHeight = _li.height();
	//与轮播直接相关的内部变量
	var	_length = _li.length,
	_slideLength = Math.ceil((_length - this.perGroup) / this.perSlideView) + 1,
	_timer = null,
	_slideIndex = 0,
	_pageDot = null,
	_isSinglePage = this.perGroup === 1 && this.perSlideView === 1,  //是否是单页滚动
	_canShowPagination = this.pagination && _isSinglePage, //是否展示分页器
  _canFade = this.fadeInAndOut && _isSinglePage,  //是否允许渐隐渐显式轮播
  _that = this;
	//其他内部变量
	var _body = $("body");

	//初始化
	var _init = function(){
		//初始化轮播样式
		_setStyle();
		//添加分页器
		if(_canShowPagination){
			_createPagination();
		}
    //单页状态下复制list头尾两个li元素
    if(_isSinglePage){
      _duplicateList();
    }
		//自动播放
		_setAutoPlay();
		//全屏模式下绑定鼠标滚轮事件
		if(_that.fullPage){
			$(document).on("mousewheel DOMMouseScroll", _bindMouseWheel);
		}
	};

	this.slidePrev = function(){
		clearInterval(_timer);
		if(_slideIndex > 0){
			_slideIndex --;
			!_canFade ?
			_slideAnimation(this.perSlideView) :
			_slideAnimation(_slideIndex);
		}
		else{
			if(this.loop){
				_slideAnimation(-this.perSlideView);
				_pageDot.eq(-1).addClass('on').siblings().removeClass('on');
				this.list.css('left', -_that.liWidth * _length + 'px');
			}
		}
	};

	this.slideNext = function(notClear){
		if(!notClear){
			clearInterval(_timer);
		}
		if(_slideIndex < _slideLength - 1){
			_slideIndex ++;
			!_canFade ?
			_slideAnimation(-this.perSlideView) :
			_slideAnimation(_slideIndex);
			if(_slideIndex === _slideLength - 1 && !this.loop){
				clearInterval(_timer);
			}
		}
		else{
			if(this.loop){
				_slideIndex = 0;
				_slideAnimation(-this.perSlideView);
				setTimeout(function(){
					this.list.css('left', 0);
				}, 1500);
				
			}
		}
	};

	var _slideTo = function(num, notClear){
		if(!notClear){
			clearInterval(_timer);
		}
		if(_canFade){
			_slideIndex = num;
			_slideAnimation(_slideIndex);
		}
		else{
			var _delta = num - _slideIndex;
			_slideIndex = num;
			_slideAnimation(-_delta * _that.perSlideView);
		}
	};

	//初始化样式
	var _setStyle = function(){
		if(_canFade){
			_that.block.width(_that.liWidth).height(_that.liHeight);
			_that.list.addClass('slide-fade');
			_li.eq(0).addClass('on');
			return;
		}
		if (_that.fullPage) {
			_li.width(_body.width());
			_li.height(_body.height());
		}
		if(_that.dir === 'horizontal'){
			_that.fullPage ?
			_that.liWidth = _li.width() :
			_that.block.width(_that.liWidth * _that.perGroup);
			_that.list.width(_that.liWidth * _length);
		}
		else{
			_that.fullPage ?
			_that.liHeight = _li.height() :
			_that.block.height(_that.liHeight * _that.perGroup);
			_that.list.height(_that.liHeight * _length);
		}
		_that.list.addClass('slide-' + _that.dir);
	};

	//初始化分页
	var _createPagination = function(){
		if(_that.outerPagination){
			_that.pagination.children().length === _length ?
			_pageDot = _that.pagination.children() :
			_pageDot = null;
		}
		else{
			var pageHtml = '';
			for(var i = 0; i < _length; i ++){
				j = _that.showPageNum ? i + 1 : '';
				pageHtml += '<a href="javascript:;">' + j + '</a>';
			}
			_that.pagination.append(pageHtml);
			_pageDot = _that.pagination.children();
		}
		_pageDot.eq(0).addClass('on');
		//绑定分页器事件
		if(_that.pageClickable){
			_pageBind();
		}
	};

	//单页状态下复制list头尾两个li元素
  var _duplicateList = function(){
    var firstList = _li.eq(0),
    lastList = _li.eq(-1);
    lastList.clone().prependTo(_that.list);
    firstList.clone().appendTo(_that.list);
    if(!_that.fadeInAndOut){
      _that.dir === 'horizontal' ?
      _that.list.css({
      	'left': -_that.liWidth + 'px',
      	'width': _that.liWidth * (_length + 2)
      }) :
      _that.list.css({
      	'top': -_that.liHeight + 'px',
      	'height': _that.liHeight * (_length + 2)
      }) ;
    }
  };

	var _setAutoPlay =function(){
		if(_that.autoPlay){
			_timer = setInterval(function(){
				_that.slideNext(true);
			}, _that.autoPlay);
		}
	};

	//分页器变换
	var _paginationChange = function(){
		_pageDot.eq(_slideIndex).addClass('on').siblings().removeClass('on');
	};

	//绑定分页器事件
	var _pageBind = function(){
		_pageDot.on('click', function(){
			_slideTo($(this).index());
		});
	};

	//绑定鼠标滚轮事件
	var _bindMouseWheel = function(e){
		e.preventDefault();
		var value = e.originalEvent.wheelDelta || -e.originalEvent.detail;
		value > 0 ?
		_that.slidePrev() :
		_that.slideNext();
	};

	//执行滚动
	var _slideAnimation = function(num){
		if(_canFade){
			_li.eq(num).fadeIn(300).siblings().fadeOut(300);
		}
		else{
			_that.dir === 'horizontal' ?
			_that.list.animate({left: '+=' + num * _that.liWidth + 'px'}, _that.speed) :
			_that.list.animate({top: '+=' + num * _that.liHeight + 'px'}, _that.speed);
		}
		if(_canShowPagination){
			_paginationChange();
		}
	};

	_init();
}