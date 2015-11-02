(function(){

	angular.module('FishingApp')

	.directive("scroll", function ($window) {
		return function($scope, element, attrs) {
			var lastScrollTop = 0;
			$(window).scroll(function(event){
				if($(this).scrollTop() > 100){
					var st = $(this).scrollTop();
					if (st > lastScrollTop){
						$('nav').addClass('reducedNav');
						$('.main').addClass('reducedMain');
					} else if(st < lastScrollTop - 5){
						$('nav').removeClass('reducedNav');
						$('.main').removeClass('reducedMain');
					}
					lastScrollTop = st;
				};
			});
		};
	});

})();