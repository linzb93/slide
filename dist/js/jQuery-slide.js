function Slider(node, config){
	var defaultPara = {
		mode: 'horizontal', //滚动方向
		speed: 500, //滚动速度
		perGroup: 1, //显示数量
		slidePerView: 1, //每次滚动的数量
		autoPlay: 0, //自动滚动的时间间隔，不大于0时关闭
		loop: true, //是否循环播放
		pagination: null, //分页器
		pageClickable: true //分页器是否可点击
	};
	$.extend(defaultPara, config);
	this.block = $(node),
	this.mode = defaultPara.mode,
	this.speed = defaultPara.speed,
	this.perGroup = defaultPara.perGroup,
	this.slidePerView = defaultPara.slidePerView,
	this.autoPlay = defaultPara.autoPlay,
	this.pagination = $(defaultPara.pagination),
	this.pageClickable = defaultPara.pageClickable;
	this.list = this.block.find('ul'),
	this.li = this.list.find('li'),
	this.length = this.li.length,
	this.slideLength = Math.ceil(this.length / this.slidePerView);
	this.liWidth = this.li.width(),
	this.liHeight = this.li.height(),
	this.slideIndex = 0,
	this.timer = null;
	var _that = this;
	this.canShowPagination = _that.pagination && _that.perGroup === 1 && _that.slidePerView === 1;
	var _init = function(){
		if(_that.mode === 'horizontal'){
			console.log(this); 
			_that.block.width(_that.liWidth * _that.perGroup);
			_that.list.width(_that.liWidth * _that.length);
			_that.list.addClass('slide-horizontal');
		}
		else if(_that.mode === 'vertical'){
			_that.block.height(_that.liHeight * _that.perGroup);
			_that.list.height(_that.liHeight * _that.length);
			_that.list.addClass('slide-vertical');
		}
		if(_that.canShowPagination){
			for(var i = 0; i< _that.length; i++){
				_that.pagination.append('<span></span>');
			}
			_that.pagination.find('span').eq(0).addClass('on');
		}
		if(_that.autoPlay){
			_that.timer = setInterval(function(){
				_that.slideNext(true);
			}, _that.autoPlay);
		}
		if(_that.pageClickable){
			_pageBind();
		}
	}

	this.slidePrev = function(){
		clearInterval(this.timer);
		if(this.slideIndex > 0){
			this.slideIndex --;
			_slideAnimation(this.slidePerView);
		}
		else{
			this.slideTo(this.slideLength - 1);
		}
	};

	this.slideNext = function(notClear){
		if(!notClear){
			clearInterval(this.timer);
		}
		if(_that.slideIndex < _that.slideLength - 1){
			_that.slideIndex ++;
			_slideAnimation(-_that.slidePerView);
		}
		else{
			_that.slideTo(0, notClear);
		}
	};

	this.slideTo = function(num, notClear){
		if(!notClear){
			clearInterval(this.timer);
		}
		var _delta = num - this.slideIndex;
		if(this.mode === 'horizontal'){
			this.list.animate({left: '-=' + _delta * _that.liWidth + 'px'}, _that.speed);
		}
		else if(this.mode === 'vertical'){
			this.list.animate({top: '-=' + _delta * _that.liHeight + 'px'}, _that.speed);
		}
		this.slideIndex = num;
		_paginationChange();
	}

	var _slideAnimation = function(num){
		if(_that.mode === 'horizontal'){
			_that.list.animate({left: '+=' + num * _that.liWidth + 'px'}, _that.speed);
		}
		else if(_that.mode === 'vertical'){
			_that.list.animate({top: '+=' + num * _that.liHeight + 'px'}, _that.speed);
		}
		if(_that.canShowPagination){
			_paginationChange();
		}
	}

	var _paginationChange = function(){
		_that.pagination.find('span').eq(_that.slideIndex).addClass('on').siblings().removeClass('on');
	}

	var _pageBind = function(){
		_that.pagination.find('span').on('click', function(){
				var dotIndex = $(this).index();
				_that.slideTo(dotIndex);
			});
	}

	_init();
}